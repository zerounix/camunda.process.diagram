Processdiagram cookbook – or howto write your own highly customizable process diagram with almost now effort
=======================

Camunda recently released their great process sharing tool camunda Share 
(Camunda Share - camunda.org/share, http://blog.camunda.org/2013/09/camunda-share-discuss-your-bpmn-20.html). 
What a great addition to their stack - we thought - and how cool it would be to be able to visualize or processes 
with or own process diagram. But we want it to be customizable. We would like to show the information we consider 
important for our users.

Source

```java server pages
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