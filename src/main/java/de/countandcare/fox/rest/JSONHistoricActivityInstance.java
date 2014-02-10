package de.countandcare.fox.rest;

import org.camunda.bpm.engine.history.HistoricActivityInstance;

public class JSONHistoricActivityInstance {
  private HistoricActivityInstance hact;
  private int count;
  
  
  public JSONHistoricActivityInstance(HistoricActivityInstance hact, int count) {
    this.hact = hact;
    this.setCount(count);
  }

  public HistoricActivityInstance getHact() {
    return hact;
  }

  public void setHact(HistoricActivityInstance hact) {
    this.hact = hact;
  }
  
  public void incrementCount(){
    this.setCount(this.getCount() + 1);
  }

  public int getCount() {
    return count;
  }

  public void setCount(int count) {
    this.count = count;
  }
}
