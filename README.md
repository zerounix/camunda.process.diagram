Processdiagram cookbook 
=======================
#customizable process diagram
Camunda recently released their great process sharing tool camunda Share 
(Camunda Share - camunda.org/share, http://blog.camunda.org/2013/09/camunda-share-discuss-your-bpmn-20.html). 
What a great addition to their software stack. How cool it would be to be able to visualize or processes 
with or own process diagram. 
But we want it to be customizable. We would like to show the information we consider important for our users.

#So let’s do it on our own
What do we need?
We use JBoss server as runtime, so we get REST Services and JSF for free. What else do we need?
Camunda Rest-Engine – the Rest Engine serves the process diagrams and some history data to us
Bootstrap 3 - http://getbootstrap.com/ - great, developer friendly styling and further useful components like popovers, which we will use in our diagram
AngularJS - http://angularjs.org/ - AngularJS is a structural framework for dynamic web apps. It lets you use HTML as your template language and lets you extend HTML's syntax to express your application's components clearly and succinctly. Out of the box, it eliminates much of the code you currently write through data binding and dependency injection. And it all happens in JavaScript within the browser, making it an ideal partner with any server technology.
Camunda BPMN JS - https://github.com/camunda/camunda-bpmn.js 
Thanks to Nico Rehwaldt (http://camunda.org/community/team.html#nico-details). This compact JS Library renders your process diagram to a SVG image and then adds an overlay to the HTML code which we can use to add CSS style classes and other useful things to it. Nico uses dojo and jQuery behind the scenes so we need those too. But no worries as there is a great little helper javascript library, requirJS, that sets up all the needed libs for us.

#So let’s start!
To visualize the process we need the actual diagram in some form and the running process instance we want to display. As we serve our processes to many tenants and camunda bpm is able to handle that too, we also pass the tenant to the engine. 

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
Prozessdiagramm zu Prozess mit der Id <small>#{p}</small>
			</h1>
			<div id="pid" style="display: none">#{p}</div>
			<div id="engine" style="display: none">myengine</div>
			<div id="diagramWrapper">
				<div id="diagram" 
process-diagram-overlay="processDiagramOverlay">
</div>
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

We define a simple JSF/HTML5 Page and pass the process id  to it via a JSF viewparam called p. 
Now we bootstrap the angularJS app with ng-app="processDiagrammApp". 
Then we import the angular application javascript with 

``` html
<script src="process.diagram.app.js"></script>. 
```

Finally we construct the angular controller with 

``` html
<div id="content" ng-controller="ProcessCtrl">. 
```

But we will inspect the angular script a little bit later.

All that information can be received by the camunda rest engine with the following calls:
Process defintion: /engine-rest/engine/<ENGINENAME>/process-instance/<PID>
This returns the definition id of the diagram we now can use
Process diagram as XML: /engine-rest/engine/<ENGINENAME>/process-definition/<DEFINITION_ID>/xml

