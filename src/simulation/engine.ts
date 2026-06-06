import { createMetrics, deriveMetrics } from "./metrics";
import type { Person, Pool, SimulationConfig, SimulationEvent, SimulationMetrics } from "../types/simulation";
import { latticePosition, poolTarget } from "../utils/layout";

export class PooledTestingEngine {
  private testsUsed = 0;
  private metrics: SimulationMetrics;

  constructor(private readonly config: SimulationConfig) {
    this.metrics = createMetrics(config.populationSize);
  }

  *run(): Generator<SimulationEvent> {
    const people = this.generatePopulation();
    this.infectPeople(people);
    this.metrics = createMetrics(this.config.populationSize, people.filter((person) => person.isSick).length);

    yield { type: "POPULATION_GENERATED", people, metrics: this.metrics };

    let infectionCount = 0;
    for (const person of people) {
      if (person.isSick) {
        infectionCount++;
        yield { type: "PERSON_INFECTED", personId: person.id, infectionCount };
      }
    }

    const pools = this.splitInGroups(people, this.config.groupSize);
    const totalPools = pools.length;

    for (const [poolIndex, group] of pools.entries()) {
      const pool = this.createPool(`pool-${poolIndex + 1}`, group, "pool");
      this.metrics = { ...this.metrics, poolsCreated: this.metrics.poolsCreated + 1 };
      group.forEach((person, memberIndex) => {
        person.poolId = pool.id;
        person.status = "pooling";
        person.target = poolTarget(poolIndex, memberIndex, group.length, totalPools);
      });

      yield { type: "POOL_CREATED", pool };

      this.testsUsed++;
      yield { type: "POOL_TEST_STARTED", poolId: pool.id, personIds: pool.personIds, testsUsed: this.testsUsed };

      for (const person of group) {
        if (person.isSick) {
          pool.status = "positive";
          this.metrics = { ...this.metrics, positivePools: this.metrics.positivePools + 1 };
          yield { type: "POOL_RESULT_POSITIVE", poolId: pool.id, personIds: pool.personIds, testsUsed: this.testsUsed };

          const subgroups = this.splitInTwo(group).map((subgroup, subgroupIndex) =>
            this.createPool(`${pool.id}-sub-${subgroupIndex + 1}`, subgroup, "subgroup"),
          );

          this.metrics = { ...this.metrics, poolsCreated: this.metrics.poolsCreated + subgroups.length };
          yield { type: "GROUP_SPLIT", sourcePoolId: pool.id, subgroups, testsUsed: this.testsUsed };

          for (const subgroup of subgroups) {
            this.testsUsed++;
            yield {
              type: "SUBGROUP_TEST_STARTED",
              poolId: subgroup.id,
              personIds: subgroup.personIds,
              testsUsed: this.testsUsed,
            };
          }

          for (const subgroup of subgroups) {
            const subgroupPeople = subgroup.personIds.map((id) => people[id]);
            const subgroupHasInfection = subgroupPeople.some((subgroupPerson) => subgroupPerson.isSick);

            if (!subgroupHasInfection) {
              subgroup.status = "negative";
              this.metrics = { ...this.metrics, negativePools: this.metrics.negativePools + 1 };
              subgroupPeople.forEach((subgroupPerson) => {
                subgroupPerson.status = "negative";
              });
              yield {
                type: "SUBGROUP_RESULT_NEGATIVE",
                poolId: subgroup.id,
                personIds: subgroup.personIds,
                testsUsed: this.testsUsed,
              };
              continue;
            }

            subgroup.status = "positive";
            this.metrics = { ...this.metrics, positivePools: this.metrics.positivePools + 1 };
            subgroupPeople.forEach((subgroupPerson) => {
              subgroupPerson.status = "positive-subgroup";
            });
            yield {
              type: "SUBGROUP_RESULT_POSITIVE",
              poolId: subgroup.id,
              personIds: subgroup.personIds,
              testsUsed: this.testsUsed,
            };

            for (const personInSplitGroup of subgroupPeople) {
              if (personInSplitGroup.isSick) {
                for (const subgroupPerson of subgroupPeople) {
                  this.testsUsed++;
                  yield {
                    type: "INDIVIDUAL_TEST_STARTED",
                    personId: subgroupPerson.id,
                    poolId: subgroup.id,
                    testsUsed: this.testsUsed,
                  };

                  if (subgroupPerson.isSick) {
                    subgroupPerson.status = "confirmed-infected";
                    yield { type: "INDIVIDUAL_POSITIVE", personId: subgroupPerson.id, testsUsed: this.testsUsed };
                  } else {
                    subgroupPerson.status = "negative";
                    yield { type: "INDIVIDUAL_NEGATIVE", personId: subgroupPerson.id, testsUsed: this.testsUsed };
                  }
                }
              }
            }
          }
        }
      }

      if (!group.some((person) => person.isSick)) {
        pool.status = "negative";
        this.metrics = { ...this.metrics, negativePools: this.metrics.negativePools + 1 };
        group.forEach((person) => {
          person.status = "negative";
        });
        yield { type: "POOL_RESULT_NEGATIVE", poolId: pool.id, personIds: pool.personIds, testsUsed: this.testsUsed };
      }

      this.metrics = deriveMetrics(people, this.metrics, this.testsUsed);
      yield { type: "METRICS_UPDATED", metrics: this.metrics };
    }

    this.metrics = deriveMetrics(people, this.metrics, this.testsUsed);
    yield { type: "SIMULATION_COMPLETE", metrics: this.metrics };
  }

  private generatePopulation(): Person[] {
    return Array.from({ length: this.config.populationSize }, (_, id) => ({
      id,
      isSick: false,
      status: "untested",
      position: latticePosition(id, this.config.populationSize),
      target: latticePosition(id, this.config.populationSize),
    }));
  }

  private infectPeople(people: Person[]) {
    for (const person of people) {
      const percentSick = Math.floor(Math.random() * 100);
      person.isSick = percentSick < this.config.infectionRate;
    }
  }

  private createPool(id: string, people: Person[], level: Pool["level"]): Pool {
    return {
      id,
      personIds: people.map((person) => person.id),
      status: "created",
      level,
    };
  }

  private splitInGroups<T>(list: T[], groupSize: number): T[][] {
    const listOfLists: T[][] = [];
    for (let i = 0; i < list.length; i += groupSize) {
      listOfLists.push(list.slice(i, Math.min(list.length, i + groupSize)));
    }
    return listOfLists;
  }

  private splitInTwo<T>(list: T[]): T[][] {
    const size = list.length;
    return [list.slice(0, Math.floor((size + 1) / 2)), list.slice(Math.floor((size + 1) / 2), size)];
  }
}
