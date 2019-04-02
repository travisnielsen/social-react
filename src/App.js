import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactAI from 'react-appinsights';

// const history = createBrowserHistory()
ReactAI.init(
  {
    instrumentationKey:'[REDACTED]',
    disableCorrelationHeaders: false,
    samplingPercentage: 100,
    enableCorsCorrelation: true
  });

var appInsights = ReactAI.ai();
appInsights.setAuthenticatedUserContext("abc123", "trniel", true);

class App extends React.Component {
  function() {
    appInsights.trackPageView({name: 'App Mounted'});
  }

  trackException() {
    appInsights.trackException({error: new Error('some error') });
  }

  trackTrace() {
    appInsights.trackTrace({message: 'some trace'});
  }

  trackEvent() {
    appInsights.trackEvent({name: 'some event'});
  }

  throwError() {
    // This will crash the app; the error will show up in the Azure Portal
    let foo = window['a']['b'];
    console.log(foo);
  }

  ajaxRequest() {
    console.log("REST call invoked");
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://trniel.azure-api.net/users/", true);

    // operation.id has a value
    var operationId = appInsights.context.operation.id;

    // operation.rootId is 'null'. Set it to the current operation?
    appInsights.context.operation.rootId = operationId;

    // Format the value of the Request-Id header based on (root) operation ID
    var requestId = "|" + operationId + ".";
    xhr.setRequestHeader('Request-ID', requestId);
    xhr.setRequestHeader("Ocp-Apim-Subscription-Key", "67f3d2869d7e49dcbfa803e84c19340f;product=unlimited");
    xhr.onload = function(e){
      if (xhr.readyState === 4){
        if (xhr.status === 200){
          // var story = JSON.parse(xhr.response).story
          /*
          this.setState({
            story: story,
            storyLength: story.length,
            currentChapter: story[0]
          })
          */
          console.log(xhr.responseText);
        } else {
          console.error(xhr.statusText)
        }
      }
    }

    xhr.onerror = function(e){
      console.error(xhr.statusText)
    }

    xhr.send();
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.trackException}>Track Exception</button>
        <button onClick={this.trackEvent}>Track Event</button>
        <button onClick={this.trackTrace}>Track Trace</button>
        <button onClick={this.throwError}>Autocollect an Error</button>
        <button onClick={this.ajaxRequest}>Autocollect a request</button>
      </div>
    );
  }
}

export default ReactAI.withTracking(App, "ReactClient");
