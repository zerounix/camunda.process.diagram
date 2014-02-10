'use strict';

angular.module('processDiagrammApp', []);

function ProcessCtrl($scope, $http, $window) {
	var zoomLevel = 1;
	var w = angular.element($window);
    $scope.showTxBoundary = false;    
		
    $scope.pid = $('#pid').text();
    $scope.engine = $('#engine').text();
    
    // get process definition and id
    $http.get('/engine-rest/engine/' + $scope.engine + '/process-instance/' + $scope.pid).success(function(data) {
    	$scope.definitionId = data.definitionId;
    }).then(function() { 
        		
		// load process xml data
    	$http.get('/engine-rest/engine/' + $scope.engine + '/process-definition/' + $scope.definitionId + '/xml').success(function(data) {
    		$scope.processXml = data;
    	});
			
		require(["bpmn/Bpmn", "dojo/domReady!", "bootstrap", "jquery-overscroll", "jquery-mousewheel"], function(Bpmn) {
		      var bpmn = new Bpmn();	      
		      	      
	      bpmn.render($scope.processXml.bpmn20Xml, {diagramElement : "diagram"});
	      $scope.ids = [];
	      $http.get('/engine-rest/engine/' + $scope.engine + '/process-instance/' + $scope.pid + '/activity-instances/').success(function(data) {
	    	  $scope.ids.push(data.activityId);
	    	  childActivities($scope.ids, data);		      		
	      }).then(function() {
	    	  angular.forEach($scope.ids, function(value,key){
	    		  $http.get('/<your application url>/process-rest/instance/' + $scope.pid + '/engine/' + $scope.engine).success(function(data) {
			    	  $scope.task = data;		    	  		      	
			      }).then(function() {
			    	  doAnnotate($scope.task.id, 1, 'label-success', ['highlight-active'], popoverContentCurrentTask($scope.task));
			      });
	    	  });		    	  		    	  
	      });
	      
	      $http.get('/<your application url>/process-rest/instance/historic/' + $scope.pid + '/engine/' + $scope.engine).success(function(data) {
	    	  $scope.historic = data;		    	  		      	
	      }).then(function() {
	    	  angular.forEach($scope.historic, function(value,key){
	    		  $scope.ids.push(value);		    		  
	    		  doAnnotate(value.id, value.count, 'label-primary', ['highlight'], popoverContent(value));
	    	  });
	      });
	      
	      function childActivities(ids, parent) {
	    	  if (parent && parent.childActivityInstances) {
    	        for (var i = 0, l = parent.childActivityInstances.length; i < l; ++i) {
    	            var child = parent.childActivityInstances[i];
    	            $scope.ids.push(child.activityId);		    	            
    	            childActivities(ids, child);
    	        }
	    	  }
	      } 
	      
	      function popoverContentCurrentTask(data) {
	    	  if (data) {
	    		  var assignee = "", dueDate = "";
	    		  if (data.assignee) {
	    			assignee = data.assignee;  
	    		  } else {
	    			  assignee = "System";
	    		  }
	    		  if (data.dueDate) {
	    			  dueDate = data.dueDate;
	    		  } else {
	    			  dueDate = 'nicht gesetzt';
	    		  }
		    	  var content =
		    	  	'<div style="display:none" id="popoverContent' + data.id + '">'
		    	  		+ '<div class="form-horizontal">'
		    	  		+	'<div class="form-group">'			    	
		    	  		
		    	  		+		'<label class="col-lg-5 control-label">Name</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static">' + data.id + '</p>'
		    	        +		'</div>'
		    	        
		    	        +		'<label class="col-lg-5 control-label">zugeordnet zu</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static">' + assignee + '</p>'
		    	        +		'</div>'
		    	        
		    	        +		'<label class="col-lg-5 control-label">Start</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static">' + data.startTime + '</p>'
		    	        +		'</div>'
		    	        
		    	        
		    	  		+		'<label class="col-lg-5 control-label">Fälligkeit</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static">' + dueDate + '</p>'
		    	        +		'</div>'
		    	        +	'</div>'
		    	        +'</div>';
	    	  } else {
	    		  return "";
	    	  }
	    	  return content;
	      }
	      
	      function popoverContent(data) {
	    	  if (data) {
	    		  var assignee = "";
	    		  if (data.assignee) {
	    			assignee = data.assignee;
	    		  } else {
	    			  assignee = "System";
	    		  }
	    		   
		    	  var content =
		    	  	'<div style="display:none" id="popoverContent' + data.id + '">'
		    	  		+ '<div class="form-horizontal">'
		    	  		+	'<div class="form-group">'
		    	  		
		    	  		+		'<label class="col-lg-5 control-label">Typ</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static">' + data.type + '</p>'
		    	        +		'</div>'
		    	  		
		    	  		+		'<label class="col-lg-5 control-label">Name</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static">' + data.id + '</p>'
		    	        +		'</div>'
		    	        
		    	        +		'<label class="col-lg-5 control-label">abgearbeitet durch</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static">' + assignee + '</p>'
		    	        +		'</div>'
		    	  		
		    	        +		'<label class="col-lg-5 control-label">Ausführungszeit (sec)</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static"> ' + data.durationInMillis / 1000 + '</p>'
		    	        +		'</div>'
		    	        
		    	        +		'<label class="col-lg-5 control-label">Start</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static">' + data.startTime + '</p>'
		    	        +		'</div>'
		    	        
		    	        
		    	  		+		'<label class="col-lg-5 control-label">Ende</label>'
		    	  		+		'<div class="col-lg-7">'
		    	        +			'<p class="form-control-static">' + data.endTime + '</p>'
		    	        +		'</div>'
		    	        +	'</div>'
		    	        +'</div>';
	    	  } else {
	    		  return "";
	    	  }
	    	  return content;
	      }
	      
	      var $element = $("#diagram");
	      initializeScrollAndZoomFunctions();
	      
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
	    	
	        	var registerEventHandlersRecursive = function(element) {	        		
        			registerEventHandlers(element.id);
        			for (var j = 0; j < element.baseElements.length; j++) {
        				var subElement = element.baseElements[j];

        				registerEventHandlers(subElement.id);
        				
                        if (subElement.type=="subProcess") {
                        	registerEventHandlersRecursive(subElement);
                        }       				
	        		}	        		
	        	};
	        	
	        	for (var i = 0; i < bpmn.processDefinitions.length; i++) {
	        		var definition = bpmn.processDefinitions[i];
	        		if (definition.baseElements) {
	        			registerEventHandlersRecursive(definition);
	        		}
	       		}
//	       	});

          /*------------------- Show/Hide Transaction Boundaries ---------------------*/
          $scope.$watch(function() { return $scope.showTxBoundary; }, function(newShowTxBoundary) {
             if (newShowTxBoundary) {
                 for (var i = 0; i < bpmn.processDefinitions.length; i++) {
                     var definition = bpmn.processDefinitions[i];
                     if (definition.baseElements) {
                         for (var j = 0; j < definition.baseElements.length; j++) {
                             var element = definition.baseElements[j];
                             if (element.type == "userTask"
                                 || (element.type == "intermediateCatchEvent" && (
                                 element.eventDefinitions[0].type == "timerEventDefinition"
                                     || element.eventDefinitions[0].type == "messageEventDefinition"
                                     || element.eventDefinitions[0].type == "signalEventDefinition"))
                                 || element["activiti:async"] == "true"
                                 || element["camunda:async"] == "true"
                                 || element.type == "receiveTask"
                                 ) {
                                 $('#' + element.id).addClass("tx-boundary-before");
                             }
                         }
                     }
                 }
             } else {
                 $('.tx-boundary-before').removeClass("tx-boundary-before");
             }
          });

	      /*------------------- Handle scroll and zoom ---------------------*/	     	     
	      
	      $scope.$watch(function() { return zoomLevel; }, function(newZoomLevel) {
	        if (!!newZoomLevel && !!bpmn) {
	          zoom(newZoomLevel);
	        }
	      });
	      
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
	      
	      function initializeScrollAndZoomFunctions() {
	        zoom(zoomLevel);
	        
	        $element.mousewheel(function($event, delta) {
	          $event.preventDefault();
	          $scope.$apply(function() {
	            zoomLevel = calculateZoomLevel(delta);
	          });
	        });
	      }
	      
	      function overscroll() {
	        $element.overscroll({captureWheel:false});
	      }

	      function removeOverscroll() {
	        $element.removeOverscroll();
	      }

	      function zoom(zoomFactor) {
	        removeOverscroll();
	        bpmn.zoom(zoomFactor);
	        overscroll();
	      }
	      
	      function calculateZoomLevel (delta) {
	        var minZoomLevelMin = 0.1;
	        var maxZoomLevelMax = 5;
	        var zoomSteps = 10;

	        var newZoomLevel = zoomLevel + Math.round((delta * 100)/ zoomSteps) / 100;

	        console.log('zoom: ' + newZoomLevel);
	        
	        if (newZoomLevel > maxZoomLevelMax) {
	          newZoomLevel = maxZoomLevelMax;
	        } else if (newZoomLevel < minZoomLevelMin) {
	          newZoomLevel = minZoomLevelMin;
	        }

	        return newZoomLevel;
	      };
	      
	      /*------------------- Handle window resize ---------------------*/
	      
	      w.bind('resize', function () {
	        $scope.$apply();
	      });
	      
	      $scope.$watch(function () {
	        return $element.width();
	      }, function(newValue, oldValue) {
	        if (bpmn) {
	          zoom(zoomLevel);
	        }
	      });
	      
	      $scope.$watch(function () {
	        return $element.height();
	      }, function(newValue, oldValue) {
	        if (bpmn) {
	          zoom(zoomLevel);
	        }
	      });
	      
	      $scope.$on('resize', function () {
	        $scope.$apply();
	      });		 
      
	      /*------------------- Handle scroll to bpmn element ---------------------*/

	      $scope.selectBpmnElement = function(elementId) {
	        if ($scope.selectedElementId) {
	          bpmn.annotation($scope.selectedElementId).removeClasses([ "highlight" ]);
	        }
	        bpmn.annotation(elementId).addClasses([ "highlight" ]);
	        scrollToBpmnElement(elementId);
	        $('#' + elementId).click();
	        $scope.selectedElementId = elementId;
	        $scope.$apply();
	      };

	      function scrollToBpmnElement(bpmnElementId) {
          for (var i = 0; i < bpmn.processDefinitions.length; i++) {
            var definition = bpmn.processDefinitions[i];
            if (definition.baseElements) {
                for (var j = 0; j < definition.baseElements.length; j++) {
                    var element = definition.baseElements[j];
                    if (element.id == bpmnElementId) {
                      scrollTo(element);
                    }
                };
            };
          };
	      }	   	      
	    });
	});		
    
	$scope.closePopup = function() {
	  $('#' + $scope.selectedElement).popover('hide');
	};	
			
}