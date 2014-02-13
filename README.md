Howto build a customizable process diagram
==========================================
Camunda recently released their great process sharing tool [camunda Share] 
(http://blog.camunda.org/2013/09/camunda-share-discuss-your-bpmn-20.html). 
What a great addition to their software stack. 
How cool it would be to be able to visualize your processes with your own process diagram. 
But we want it to be customizable. We would like to show the information we consider important for our users.

![process diagram result](https://raw.github.com/zerounix/camunda.process.diagram/master/src/main/dia.PNG)

#So why not do it on our own
What do we need?
We use JBoss server as runtime, so we get REST Services and JSF for free. What else do we need?

* Camunda Rest-Engine – the Rest Engine serves the process diagrams and some history data to us
* Bootstrap 3 - http://getbootstrap.com/ - great, developer friendly styling and further useful components like popovers, which we will use in our diagram
* AngularJS - http://angularjs.org/ - AngularJS is a structural framework for dynamic web apps. It lets you use HTML as your template language and lets you extend HTML's syntax to express your application's components clearly and succinctly. Out of the box, it eliminates much of the code you currently write through data binding and dependency injection. And it all happens in JavaScript within the browser, making it an ideal partner with any server technology.
* Camunda BPMN JS - https://github.com/camunda/camunda-bpmn.js 
Thanks to [Nico Rehwaldt](http://camunda.org/community/team.html#nico-details). This compact JS Library renders your process diagram to a SVG image and then adds an overlay to the HTML code which we can use to add CSS style classes and other useful things to it. Nico uses dojo and jQuery behind the scenes so we need those too. But no worries as there is a great little helper javascript library, requirJS, that sets up all the needed libs for us.

#Let’s start!
To visualize the process we need the actual diagram in some form and the running process instance we want to display. 

All that information can be received by the camunda rest engine with the following calls:

* Process defintion: /engine-rest/engine/<ENGINENAME>/process-instance/<PID> -> returns the definition id of the diagram we now can use
* Process diagram as XML: /engine-rest/engine/<ENGINENAME>/process-definition/<DEFINITION_ID>/xml

As we serve our processes to many tenants and camunda bpm is able to handle that too, we also pass the tenant to the engine (see ENGINENAME above).

Source

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="de" xmlns="http://www.w3.org/1999/xhtml"
	xmlns:ui="http://java.sun.com/jsf/facelets"
	xmlns:f="http://java.sun.com/jsf/core"
	xmlns:h="http://java.sun.com/jsf/html" 
ng-app="processDiagrammApp">

<f:view contentType="text/html">

	<f:metadata>
		<f:viewParam name="p" />
	</f:metadata>

	<h:head>
		<f:facet name="first">
			<script src="lib/jquery/jquery-1.7.2.min.js"></script>
			<script src="lib/require/require.min.js"></script>
			<script src="lib/angular/angular.min.js"></script>
			<script src="lib/angular/angular-resource.min.js"></script>

			<script src="process.diagram.app.js"></script>
		</f:facet>
		<h:outputStylesheet library="css" name="bootstrap3.css" />
	</h:head>
	<h:body>
		<div id="content" ng-controller="ProcessCtrl">
			<h1>
				process diagram for process with id <small>#{p}</small>
			</h1>
			<div id="pid" style="display: none">#{p}</div>
			<div id="engine" style="display: none">myengine</div>
			<div id="diagramWrapper">
				<div id="diagram" process-diagram-overlay="processDiagramOverlay"></div>
			</div>
		</div>
		<script>
			require({
				baseUrl: "./",
				paths: {
				  'jquery' : 'lib/jquery/jquery-1.7.2.min',
				  'bpmn/Bpmn' : 'lib/bpmn/bpmn.min',
				  'bootstrap' : 'lib/bootstrap/bootstrap3.min',				  
				  'jquery-mousewheel' : 'lib/jquery/jquery.mousewheel',
				  'jquery-overscroll' : 'lib/jquery/jquery.overscroll'
				},
				shim: {
				 'jquery-mousewheel' : { deps: [ 'jquery' ] },
				 'jquery-overscroll' : { deps: [ 'jquery' ] },
				 'bootstrap' : { deps: [ 'jquery' ] },				 
				},				      
				packages: [
				  { name: "dojo", location: "lib/dojo/dojo" },
				  { name: "dojox", location: "lib/dojo/dojox"}
				]
		    });
		</script>
	</h:body>
</f:view>
</html>
```

We define a simple JSF/HTML5 Page and pass the process id to it via a JSF viewparam called p. 
Now we bootstrap the angularJS app with 

``` html
ng-app="processDiagrammApp"
```

in the opening html tag.

Then we import the angular application javascript with 

``` html
<script src="process.diagram.app.js"></script>. 
```

Finally we construct the angular controller with 

``` html
<div id="content" ng-controller="ProcessCtrl">. 
```

But we will inspect the angular script a little bit later.

Now let requirejs import all the needed javascript dependencies for us with 

``` html
<script>
	require({
		baseUrl: "./",
		paths: {
		  'jquery' : 'lib/jquery/jquery-1.7.2.min',
		  'bpmn/Bpmn' : 'lib/bpmn/bpmn.min',
		  'bootstrap' : 'lib/bootstrap/bootstrap3.min',				  
		  'jquery-mousewheel' : 'lib/jquery/jquery.mousewheel',
		  'jquery-overscroll' : 'lib/jquery/jquery.overscroll'
		},
		shim: {
		 'jquery-mousewheel' : { deps: [ 'jquery' ] },
		 'jquery-overscroll' : { deps: [ 'jquery' ] },
		 'bootstrap' : { deps: [ 'jquery' ] },				 
		},				      
		packages: [
		  { name: "dojo", location: "lib/dojo/dojo" },
		  { name: "dojox", location: "lib/dojo/dojox"}
		]
	});
</script>
```

This imports jquery, the camunda.bpmn.js lib, bootstrap, mousewheel libs for scrolling and dojo 
and we are ready to go when it comes to setup and dependencies. You will find this to be pretty similar
to camundas share application ;).

# The angularjs controller - process.diagram.app.js
First of all let's get the two most important variables we need passed to the jsf page, namely the process id and the name of the process engine we want to
query:

``` javascript
	$scope.pid = $('#pid').text();
    $scope.engine = $('#engine').text();
```

Now we query camundas REST engine with the process id to retrieve the definition id of the actual process:

``` javascript
	// get process definition and id
    $http.get('/engine-rest/engine/' + $scope.engine + '/process-instance/' 
		+ $scope.pid).success(function(data) {
    	$scope.definitionId = data.definitionId;
    }).then(function() { 
	...
```

With the definition id we can query camundas REST engine to get the XML representation of the process:

``` javascript
	// load process xml data
    $http.get('/engine-rest/engine/' + $scope.engine + '/process-definition/' + $scope.definitionId + '/xml').success(function(data) {
    	$scope.processXml = data;
    });
```

Now we can draw the process diagram with the help of camundas bpmn.js lib to the div we defined in our jsf page with the id diagram:

``` javascript
	var bpmn = new Bpmn();	      	      	      
	bpmn.render($scope.processXml.bpmn20Xml, {diagramElement : "diagram"});
```

``` html
	<div id="diagram" process-diagram-overlay="processDiagramOverlay"></div>
```

# Add your data to the diagram
To enhance the application we need to provide our information to the diagram. Therefore we create a REST service to serve the
data to the diagram application.

This is pretty straightforeward:

* Activate REST for your webapp for example like this under the url **/process-rest/** by creating the following class

``` java
package de.countandcare.fox.rest;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("/process-rest")
public class RESTActivator extends Application {

}
```

* Now serve the wanted data under the url **/instance/<pid>/engine/<enginename>** and **/instance/historic/<pid>/engine/<enginename>**

``` java
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
```

# display your data in the process diagram
So let's go back to the angular controller and display the new data to the user.

``` javascript
	$scope.ids = [];
	$http.get('/engine-rest/engine/' + $scope.engine + '/process-instance/' + $scope.pid 
		+ '/activity-instances/').success(function(data) {
		$scope.ids.push(data.activityId);
	    childActivities($scope.ids, data);		      		
	}).then(function() {
		angular.forEach($scope.ids, function(value,key){
			$http.get('/<your application url>/process-rest/instance/' + $scope.pid 
				+ '/engine/' + $scope.engine).success(function(data) {
				$scope.task = data;		    	  		      	
			}).then(function() {
				doAnnotate($scope.task.id, 1, 'label-success', 
					['highlight-active'], popoverContentCurrentTask($scope.task));
			});
		});		    	  		    	  
	});
```

With the first $http.get call we query for the activity instances of the process. These then will be save to an array called $scope.ids.
As there is the possibility to have activities in subprocesses we do some recursion with the function **childActivities**. 

``` javascript
function childActivities(ids, parent) {
	if (parent && parent.childActivityInstances) {
		for (var i = 0, l = parent.childActivityInstances.length; i < l; ++i) {
			var child = parent.childActivityInstances[i];
			$scope.ids.push(child.activityId);		    	            
			childActivities(ids, child);
		}
	}
} 
```

As you cann see my javascript code kills little angels :-)

If everything worked we now go through the list of activities and get the extra information we provide with our custom REST services from above:

``` javascript
	angular.forEach($scope.ids, function(value,key){
		$http.get('/<your application url>/process-rest/instance/' + $scope.pid 
			+ '/engine/' + $scope.engine).success(function(data) {
			$scope.task = data;		    	  		      	
		}).then(function() {
			doAnnotate($scope.task.id, 1, 'label-success', 
				['highlight-active'], popoverContentCurrentTask($scope.task));
		});
	});		 
```

The new information we then add with the function **doAnnotate** as overlay to the bpmn diagram onto the page:

``` javascript
function doAnnotate(activityId, count, labelStyle, styleClasses, popoverHtml) {
  executeAnnotation(activityId, '<span class="label ' + labelStyle + '">1</span>', styleClasses, popoverHtml);
}

function executeAnnotation(activityId, innerHtml, styleClasses, popoverHtml) {
  // in that case there no badges are existings, so the first one will initially added.
  try {
	var annotation = bpmn.annotation(activityId);
	annotation.addClasses(styleClasses);
	annotation.addDiv(innerHtml, ['label-position']);
	annotation.addDiv(popoverHtml, []);
  } catch (error) {
	  console.log('Could not annotate activity \'' + activityId + '\': ' + error.message);
  }
}    
```

The doAnnotate function adds to each activity a **span**. We furthermore add the extra data to another **div,** which we will display
as a bootstrap popover onclick on the span.

Here the code for the onclick bootstrap popover stuff:

``` javascript 
/*-------------- Click Handlers ------------------*/
var registerEventHandlers = function (elementId) {    				
	var overlay = bpmn.getOverlay(elementId);				
	
	if (overlay) {					  
		overlay							
		// register click and load popover content
		.click(elementId, function ($event) {   						
			// hide the last selected element (if existant) 
			if ($scope.selectedElement && $scope.selectedElement!=elementId) {
				$scope.closePopup();
			}
			// now the new one
			$scope.selectedElement = elementId;
			$scope.$apply();
		})
		// show popover
		.popover({
			  html: true,
			  title:"Prozessinformation",
			  content :  function() {
				  return $('#popoverContent' + elementId).html();       				             
			  },
			  container: "body"
		});						
	}
};
```

Depending on the kind of activity, if it is the current active one or already processed activity, we use different css classes. 
Blue border means already processed and green border is the currently active one. As the content of the popover also differs here
we provide two different functions **popoverContentCurrentTask(data)** and **popoverContent(data))** for processing the content.

# Contribute!
If you like it use it and let me know. Or maybe fix some of the uglier parts? :)
