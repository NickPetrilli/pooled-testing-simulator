import java.util.*;

public class PooledTesting {
    
    public static int infectionRate = 2; // represents 2% infection rate
    public static int groupSize = 8;
    public static int numTests = 0;
    

    public static void main(String[] args) {

        System.out.println("Welcome to my Pooled Testing Simulation! In this simulation the disease has an infection rate of 2% and individuals will be tested in groups of 8.");
        System.out.println("Enter a population size that you want to test on. (1,000, 10,000, 100,000 or 1,000,0000)");
        System.out.print("Population size: ");

        Scanner input = new Scanner(System.in);
        int populationSize = input.nextInt();

        List<Person> peopleList = new ArrayList<>(populationSize);
        ListPeople listPeople = new ListPeople(peopleList);

        listPeople.addPeople(populationSize);
        input.close();

        System.out.println("\n--Running testing simulation for " + populationSize + " people--\n");

        infect(peopleList, listPeople);

        test(peopleList, listPeople);

        System.out.println("\nNumber of tests needed for " + populationSize + " people is " + numTests + "\n");

   
        


    

    }
    public static void infect(List<Person> peopleList, ListPeople listPeople) {
        //infect population with disease with 2% infection rate
        listPeople.giveDisease(infectionRate);
        int infectionCount = 0;
        for (int i = 0; i < listPeople.size(); i++) {
            if (peopleList.get(i).getIsSick() == 1) {
                infectionCount++;
                //printing out for greater than 10,000 is too many 
                if (peopleList.size() <= 10000) {
                    System.out.println("Person " + i + " has been infected");
                }//if

            }//if
        }//for
        System.out.println("The total number of people infected for population size " + peopleList.size() + " is " + infectionCount);
    }

    public static void test(List<Person> peopleList, ListPeople listPeople) {
        /*
        testing group size at a time (8) so split up list into groups of 8 
        if infection is found
            split into two lists
            if one group shows infection and other does not
                everyone in infect group tested individually, other group clear
            else both groups show infection
                test all members of both groups
        */

    
        List<List<Person>> listOfLists = splitInGroups(listPeople.getList(), groupSize);
        //iterate through each list of 8 
        for (List<Person> list: listOfLists) {
            numTests++;
            //then iterate through each person in list
            for (Person person: list) {
                //test if anyone of the 8 are sick
                if (person.getIsSick() == 1) {
                    //need to split this list into two groups of 4 here
                    List<List<Person>> splitList = new ArrayList<>();
                    splitList = splitInTwo(list);
                    //iterate through new list of lists with the new groups of 4
                    //increment test
                    for (int i = 0; i < splitList.size(); i++) {
                        numTests++;
                    }
                    //now need to iterate through the two lists of 4
                    for (List<Person> splitGroup: splitList) {
                        //iterate through the individual people in the lists of 4
                        for (Person personInSplitGroup: splitGroup) {
                            //if anyone is sick, need to test every person in each of the two groups of 4
                            if (personInSplitGroup.getIsSick() == 1) {
                                for (int j = 0; j < splitGroup.size(); j++) {
                                    numTests++;
                                }//for
                            }//if
                        }//for
                    }//for

                }//if
            }//for
        }//for
    }

    //splits original list up into groups of 8
    //returns a list of lists (of 8 each)
    public static <T> List<List<T>> splitInGroups(List<T> list, int groupSize) {
        List<List<T>> listOfLists = new ArrayList<List<T>>();
        for (int i = 0; i < list.size(); i += groupSize) {
            //adds sublist of original list from i to groupSize
            //i + groupSize exceeds the list size for the last list, so the min function is used for that case
            listOfLists.add(new ArrayList<T>(list.subList(i, Math.min(list.size(), i + groupSize))));
        }
        return listOfLists;
    }

    //split list of 8 into two lists of 4
    //also returns list of list (the two lists of 4)
    public static <T> List<List<T>> splitInTwo(List<T> list) {
        List<List<T>> listsOfFour = new ArrayList<List<T>>();

        int size = list.size();
    
        List<T> first = new ArrayList<>(list.subList(0, (size + 1) / 2));
        List<T> second = new ArrayList<>(list.subList((size + 1) / 2, size));

        listsOfFour.add(first);
        listsOfFour.add(second);

        return listsOfFour;


    }
    public static void resetTests() {
        numTests = 0;
    }


    
}
