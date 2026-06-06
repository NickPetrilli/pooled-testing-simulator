public class Person {

    //0 represents not sick, 1 reprents sick
    private int isSick = 0;

    //construct person object
    public Person(int isSick) {
        this.isSick = isSick;
    }
    
    public void setIsSick(int isSick) {
        this.isSick = isSick;
    }
    public int getIsSick() {
        return this.isSick;
    }
    
}
