package de.countandcare.fox.rest;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;

import javax.inject.Named;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.camunda.bpm.BpmPlatform;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.history.HistoricActivityInstance;
import org.camunda.bpm.engine.task.Task;

@Named
@Path("/instance")
public class ProcessDiagramRestService implements Serializable {

  private static final long serialVersionUID = 4530821739129644681L;
  
  @GET
  @Path("{pid}/engine/{enginename}")
  @Produces(MediaType.APPLICATION_JSON)
  public String getJSONActivityInstance(@PathParam("enginename") String enginename, @PathParam("pid") String id) {
    
    ProcessEngine processEngine = BpmPlatform.getProcessEngineService().getProcessEngine(enginename);
    
    SimpleDateFormat formater = new SimpleDateFormat("dd.MM.yyyy");
    List<Task> tasks = processEngine.getTaskService().createTaskQuery().processInstanceId(id).list();    
    
    for (Task task : tasks) {
      JsonObjectBuilder builder = Json.createObjectBuilder();
      if (task != null) {
        builder.add("id", task.getTaskDefinitionKey());
        if (task.getAssignee() != null) {
            builder.add("assignee", task.getAssignee());
        }
            builder.add("startTime", formater.format(task.getCreateTime()));
        if (task.getDueDate() != null) {
            builder.add("dueDate", formater.format(task.getDueDate()));
        }                  
      } 
      return builder.build().toString();
    }      
    return "";
  }
  
  @GET
  @Path("/historic/{pid}/engine/{enginename}")
  @Produces(MediaType.APPLICATION_JSON)
  public String getJSONHistoricActivityInstance(@PathParam("enginename") String enginename, @PathParam("pid") String id) {
    ProcessEngine processEngine = BpmPlatform.getProcessEngineService().getProcessEngine(enginename);
    
    HashMap<String,JSONHistoricActivityInstance> aMap = new HashMap<String,JSONHistoricActivityInstance>();
    List<HistoricActivityInstance> hlist = processEngine.getHistoryService().createHistoricActivityInstanceQuery().processInstanceId(id).list();

    for (HistoricActivityInstance hact : hlist) {
      if (hact.getEndTime() != null) {
        if(aMap.containsKey(hact.getActivityId())){          
          aMap.get(hact.getActivityId()).incrementCount();
        }else{          
          JSONHistoricActivityInstance pact = new JSONHistoricActivityInstance(hact,1);
          aMap.put(hact.getActivityId(), pact);
        }        
      }
    }
    
    SimpleDateFormat formater = new SimpleDateFormat("dd.MM.yyyy");
    JsonArrayBuilder jsonArrayBuilder= Json.createArrayBuilder();
    for (JSONHistoricActivityInstance instance : aMap.values()) {
        JsonObject obj = Json.createObjectBuilder()
        .add("count", instance.getCount())
        .add("id", instance.getHact().getActivityId())
        .add("assignee", instance.getHact().getAssignee()==null?"":instance.getHact().getAssignee())
        .add("durationInMillis", instance.getHact().getDurationInMillis())
        .add("startTime", formater.format(instance.getHact().getStartTime()))                
        .add("endTime", formater.format(instance.getHact().getEndTime()))
        .add("type", instance.getHact().getActivityType())        
        .build();
        
        jsonArrayBuilder.add(obj);
    }
    
    return jsonArrayBuilder.build().toString();
  }
  
}