import java.util.*;

public class ListPeople {
    
    private List<Person> listPeople = new ArrayList<>();
    
    //List of people constructor
    public ListPeople(List<Person> listPeople) {
        this.listPeople = listPeople;
    }

    //Adds specified number of people into list to represent population
    public void addPeople(int numPeople) {
        for (int i = 0; i < numPeople; i++) {
            Person person = new Person(0);
            listPeople.add(person);
        }
    }

    //Infection rate is set to 2%, so this infects 2% of the population
    //Generates random number between 0 and 100, if its less than 2 the person gets infected
    public void giveDisease(int infectionRate) {
        for (int i = 0; i < listPeople.size(); i++) {
            Random rand = new Random();
            int percentSick = rand.nextInt(100);
            if (percentSick < infectionRate) {
                listPeople.get(i).setIsSick(1);
            }
        }
    }

    public int size() {
        return listPeople.size();
    }

    public List<Person> getList() {
        return listPeople;
    }
    
}
