(function() {
  window._satellite = window._satellite || {};
  window._satellite.container = {
  "buildInfo": {
    "buildDate": "2023-04-13T20:44:36Z",
    "turbineBuildDate": "2023-02-22T20:37:26Z",
    "turbineVersion": "27.5.0"
  },
  "environment": {
    "id": "ENf9310b3b5c254ff9a25437c4c8396f9d",
    "stage": "development"
  },
  "dataElements": {
    "Test Computed State": {
      "modulePath": "gcoe-adobe-client-data-layer/src/lib/dataElements/datalayerComputedState.js",
      "settings": {
        "path": "component.button-7eea64c765.parentId"
      }
    }
  },
  "extensions": {
    "adobe-analytics": {
      "displayName": "Adobe Analytics",
      "hostedLibFilesBaseUrl": "https://github.com/mydemosites/mydemosites.github.io/blob/main/adobe/dev/38e40b98b9df/b47210d3face/8f8f2c5d0445/hostedLibFiles/EP171e731c9ba34f1c950c36d26e3efd61/",
      "settings": {
        "orgId": "0B96B03459707BE40A495C70@AdobeOrg",
        "libraryCode": {
          "type": "managed",
          "accounts": {
            "staging": [
              "ageo1xxpnwactivatenewco"
            ],
            "production": [
              "ageo1xxpnwactivatenewco"
            ],
            "development": [
              "ageo1xxpnwactivatenewco"
            ]
          },
          "useActivityMap": true,
          "scopeTrackerGlobally": true
        },
        "trackerProperties": {
          "currencyCode": "USD",
          "trackingServer": "ageo1xxpnwactivate.sc.omtrdc.net",
          "trackInlineStats": true,
          "trackDownloadLinks": true,
          "trackExternalLinks": true,
          "trackingServerSecure": "ageo1xxpnwactivate.sc.omtrdc.net",
          "linkDownloadFileTypes": [
            "doc",
            "docx",
            "eps",
            "jpg",
            "png",
            "svg",
            "xls",
            "ppt",
            "pptx",
            "pdf",
            "xlsx",
            "tab",
            "csv",
            "zip",
            "txt",
            "vsd",
            "vxd",
            "xml",
            "js",
            "css",
            "rar",
            "exe",
            "wma",
            "mov",
            "avi",
            "wmv",
            "mp3",
            "wav",
            "m4v"
          ]
        }
      },
      "modules": {
        "adobe-analytics/src/lib/sharedModules/getTracker.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var cookie = require('@adobe/reactor-cookie');
var Promise = require('@adobe/reactor-promise');
var window = require('@adobe/reactor-window');
var settingsHelper = require('../helpers/settingsHelper');
var augmenters = require('../helpers/augmenters');

var applyTrackerVariables = require('../helpers/applyTrackerVariables');
var loadLibrary = require('../helpers/loadLibrary');
var generateVersion = require('../helpers/generateVersion');

var version = generateVersion(turbine.buildInfo.turbineBuildDate);
var BEFORE_SETTINGS_LOAD_PHASE = 'beforeSettings';

var mcidInstance = turbine.getSharedModule('adobe-mcid', 'mcid-instance');

var checkEuCompliance = function(trackingCoookieName) {
  if (!trackingCoookieName) {
    return true;
  }

  var euCookieValue = cookie.get(trackingCoookieName);
  return euCookieValue === 'true';
};

var augmentTracker = function(tracker) {
  return Promise.all(augmenters.map(function(augmenterFn) {
    var result;

    // If a tracker augmenter fails, we don't want to fail too. We'll re-throw the error in a
    // timeout so it still hits the console but doesn't reject our promise.
    try {
      result = augmenterFn(tracker);
    } catch (e) {
      setTimeout(function() {
        throw e;
      });
    }

    return Promise.resolve(result);
  })).then(function() {
    return tracker;
  });
};

var linkVisitorId = function(tracker) {
  if (mcidInstance) {
    turbine.logger.info('Setting MCID instance on the tracker.');
    tracker.visitor = mcidInstance;
  }

  return tracker;
};

var updateTrackerVersion = function(tracker) {
  turbine.logger.info('Setting version on tracker: "' + version + '".');

  if (typeof tracker.tagContainerMarker !== 'undefined') {
    tracker.tagContainerMarker = version;
  } else if (typeof tracker.version === 'string'
    && tracker.version.substring(tracker.version.length - 5) !== ('-' + version)) {
    tracker.version += '-' + version;
  }

  return tracker;
};

var updateTrackerVariables = function(trackerProperties, customSetup, tracker) {
  if (customSetup.loadPhase === BEFORE_SETTINGS_LOAD_PHASE && customSetup.source) {
    turbine.logger.info('Calling custom script before settings.');
    customSetup.source.call(window, tracker);
  }

  applyTrackerVariables(tracker, trackerProperties || {});

  if (customSetup.loadPhase !== BEFORE_SETTINGS_LOAD_PHASE && customSetup.source) {
    turbine.logger.info('Calling custom script after settings.');
    customSetup.source.call(window, tracker);
  }

  return tracker;
};

var initializeAudienceManagement = function(settings, tracker) {
  if (settingsHelper.isAudienceManagementEnabled(settings)) {
    tracker.loadModule('AudienceManagement');
    turbine.logger.info('Initializing AudienceManagement module');
    tracker.AudienceManagement.setup(settings.moduleProperties.audienceManager.config);
  }
  return tracker;
};

var initialize = function(settings) {
  if (checkEuCompliance(settings.trackingCookieName)) {
    return loadLibrary(settings)
      .then(augmentTracker)
      .then(linkVisitorId)
      .then(updateTrackerVersion)
      .then(updateTrackerVariables.bind(
        null,
        settings.trackerProperties,
        settings.customSetup || {}
      ))
      .then(initializeAudienceManagement.bind(null, settings));
  } else {
    return Promise.reject('EU compliance was not acknowledged by the user.');
  }
};

var promise = initialize(turbine.getExtensionSettings());
module.exports = function() {
  return promise;
};

          }
,
          "name": "get-tracker",
          "shared": true
        },
        "adobe-analytics/src/lib/sharedModules/augmentTracker.js": {
          "name": "augment-tracker",
          "shared": true,
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2017 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

var augmenters = require('../helpers/augmenters');

module.exports = function(fn) {
  augmenters.push(fn);
};

          }

        },
        "adobe-analytics/src/lib/helpers/settingsHelper.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2020 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

var window = require('@adobe/reactor-window');

var settingsHelper = {
  LIB_TYPES: {
    MANAGED: 'managed',
    PREINSTALLED: 'preinstalled',
    REMOTE: 'remote',
    CUSTOM: 'custom'
  },

  MANAGED_LIB_PATHS: {
    APP_MEASUREMENT: 'AppMeasurement.js',
    ACTIVITY_MAP: 'AppMeasurement_Module_ActivityMap.js',
    AUDIENCE_MANAGEMENT: 'AppMeasurement_Module_AudienceManagement.js',
  },

  getReportSuites: function(reportSuitesData) {
    var reportSuiteValues = reportSuitesData.production;
    if (reportSuitesData[turbine.environment.stage]) {
      reportSuiteValues = reportSuitesData[turbine.environment.stage];
    }

    return reportSuiteValues.join(',');
  },

  isActivityMapEnabled: function(settings) {
    return !(settings.libraryCode &&
      !settings.libraryCode.useActivityMap &&
      settings.libraryCode.useActivityMap === false);
  },

  isAudienceManagementEnabled: function(settings) {
    var isEnabled = false;
    // check if audience management module should be enabled
    if (settings &&
      settings.moduleProperties &&
      settings.moduleProperties.audienceManager &&
      settings.moduleProperties.audienceManager.config &&
      window &&
      window._satellite &&
      window._satellite.company &&
      window._satellite.company.orgId) {
      isEnabled = true;
    }

    return isEnabled;
  }
};

module.exports = settingsHelper;

          }

        },
        "adobe-analytics/src/lib/helpers/augmenters.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2017 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

module.exports = [];

          }

        },
        "adobe-analytics/src/lib/helpers/applyTrackerVariables.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var queryString = require('@adobe/reactor-query-string');
var window = require('@adobe/reactor-window');

var eVarRegExp = /eVar([0-9]+)/;
var propRegExp = /prop([0-9]+)/;
var linkTrackVarsKeys = new RegExp('^(eVar[0-9]+)|(prop[0-9]+)|(hier[0-9]+)|campaign|purchaseID|' +
  'channel|server|state|zip|pageType$');

var onlyUnique = function(value, index, self) {
  return self.indexOf(value) === index;
};

var buildLinkTrackVars = function(tracker, newTrackerProperties, addEvents) {
  var linkTrackVarsValues = Object.keys(newTrackerProperties)
    .filter(linkTrackVarsKeys.test.bind(linkTrackVarsKeys));

  if (addEvents) {
    linkTrackVarsValues.push('events');
  }

  // Merge with the values already set on tracker.
  linkTrackVarsValues = linkTrackVarsValues.concat((tracker.linkTrackVars || '').split(','));

  return linkTrackVarsValues.filter(function(value, index) {
    return value !== 'None' && value && onlyUnique(value, index, linkTrackVarsValues);
  }).join(',');
};

var buildLinkTrackEvents = function(tracker, eventsData) {
  var linkTrackEventsValues = eventsData.map(function(event) {
    return event.name;
  });

  // Merge with the values already set on tracker.
  linkTrackEventsValues = linkTrackEventsValues.concat((tracker.linkTrackEvents || '').split(','));

  return linkTrackEventsValues.filter(function(value, index) {
    return value !== 'None'  && onlyUnique(value, index, linkTrackEventsValues);
  }).join(',');
};

var commaJoin = function(store, keyName, trackerProperties) {
  store[keyName] = trackerProperties[keyName].join(',');
};

var variablesTransform = function(store, keyName, trackerProperties) {
  var dynamicVariablePrefix = trackerProperties.dynamicVariablePrefix || 'D=';

  trackerProperties[keyName].forEach(function(variableData) {
    var value;
    if (variableData.type === 'value') {
      value = variableData.value;
    } else {
      var eVarData = eVarRegExp.exec(variableData.value);

      if (eVarData) {
        value = dynamicVariablePrefix + 'v' + eVarData[1];
      } else {
        var propData = propRegExp.exec(variableData.value);

        if (propData) {
          value = dynamicVariablePrefix + 'c' + propData[1];
        }
      }
    }

    store[variableData.name] = value;
  });
};

var transformers = {
  linkDownloadFileTypes: commaJoin,
  linkExternalFilters: commaJoin,
  linkInternalFilters: commaJoin,
  hierarchies: function(store, keyName, trackerProperties) {
    trackerProperties[keyName].forEach(function(hierarchyData) {
      store[hierarchyData.name] = hierarchyData.sections.join(hierarchyData.delimiter);
    });
  },
  props: variablesTransform,
  eVars: variablesTransform,
  campaign: function(store, keyName, trackerProperties) {
    if (trackerProperties[keyName].type === 'queryParam') {
      var queryParams = queryString.parse(window.location.search);
      store[keyName] = queryParams[trackerProperties[keyName].value];
    } else {
      store[keyName] = trackerProperties[keyName].value;
    }
  },
  events: function(store, keyName, trackerProperties) {
    var events = trackerProperties[keyName].map(function(data) {
      var entry = data.name;
      if (data.id) {
        entry = [entry, data.id].join(':');
      }
      if (data.value) {
        entry = [entry, data.value].join('=');
      }
      return entry;
    });
    store[keyName] = events.join(',');
  }
};

module.exports = function(tracker, trackerProperties) {
  var newProperties = {};
  trackerProperties = trackerProperties || {};

  Object.keys(trackerProperties).forEach(function(propertyName) {
    var transform = transformers[propertyName];
    var value = trackerProperties[propertyName];

    if (transform) {
      transform(newProperties, propertyName, trackerProperties);
    } else {
      newProperties[propertyName] = value;
    }
  });

  // New events are added to existing tracker events
  if (newProperties.events) {
    if (tracker.events && tracker.events.length > 0) {
      newProperties.events = tracker.events + ',' + newProperties.events;
    }
  }

  var hasEvents =
    trackerProperties && trackerProperties.events && trackerProperties.events.length > 0;
  var linkTrackVars = buildLinkTrackVars(tracker, newProperties, hasEvents);
  if (linkTrackVars) {
    newProperties.linkTrackVars = linkTrackVars;
  }

  var linkTrackEvents = buildLinkTrackEvents(tracker, trackerProperties.events || []);
  if (linkTrackEvents) {
    newProperties.linkTrackEvents = linkTrackEvents;
  }

  turbine.logger.info(
    'Applying the following properties on tracker: "' +
    JSON.stringify(newProperties) +
    '".'
  );

  Object.keys(newProperties).forEach(function(propertyName) {
    tracker[propertyName] = newProperties[propertyName];
  });
};

          }

        },
        "adobe-analytics/src/lib/helpers/loadLibrary.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var loadScript = require('@adobe/reactor-load-script');
var window = require('@adobe/reactor-window');
var Promise = require('@adobe/reactor-promise');
var settingsHelper = require('./settingsHelper');
var pollHelper = require('./pollHelper');

var createTracker = function(settings, reportSuites) {
  if (!window.s_gi) {
    throw new Error(
      'Unable to create AppMeasurement tracker, `s_gi` function not found.' + window.AppMeasurement
    );
  }
  turbine.logger.info('Creating AppMeasurement tracker with these report suites: "' +
    reportSuites + '"');
  var tracker = window.s_gi(reportSuites);
  if (settings.libraryCode.scopeTrackerGlobally) {
    turbine.logger.info('Setting the tracker as window.s');
    window.s = tracker;
  }
  return tracker;
};

/**
 * @param settings
 *
 * @return array
 */
var getUrlsToLoad = function(settings) {
  var urls = [];
  switch (settings.libraryCode.type) {
    case settingsHelper.LIB_TYPES.MANAGED:
      // load app measurement
      urls.push(turbine.getHostedLibFileUrl(settingsHelper.MANAGED_LIB_PATHS.APP_MEASUREMENT));
      // check if activity map should be loaded
      if (settingsHelper.isActivityMapEnabled(settings)) {
        urls.push(turbine.getHostedLibFileUrl(settingsHelper.MANAGED_LIB_PATHS.ACTIVITY_MAP));
      }
      break;
    case settingsHelper.LIB_TYPES.CUSTOM:
      urls.push(settings.libraryCode.source);
      break;
    case settingsHelper.LIB_TYPES.REMOTE:
      urls.push(window.location.protocol === 'https:' ?
        settings.libraryCode.httpsUrl : settings.libraryCode.httpUrl);
      break;
  }
  // check if audience management should be loaded
  if (settingsHelper.isAudienceManagementEnabled(settings)) {
    var visitorServiceConfig = {
      namespace: window._satellite.company.orgId
    };
    settings.moduleProperties.audienceManager.config.visitorService = visitorServiceConfig;
    urls.push(turbine.getHostedLibFileUrl(settingsHelper.MANAGED_LIB_PATHS.AUDIENCE_MANAGEMENT));
  }
  return urls;
};

var loadLibraryScripts = function(settings) {
  return Promise.all(getUrlsToLoad(settings).map(function(url) {
    turbine.logger.info("Loading script: " + url);
    return loadScript(url);
  }));
};

var setReportSuitesOnTracker = function(settings, tracker) {
  if (settings.libraryCode.accounts) {
    if (!tracker.sa) {
      turbine.logger.warn('Cannot set report suites on tracker. `sa` method not available.');
    } else {
      var reportSuites = settingsHelper.getReportSuites(settings.libraryCode.accounts);
      turbine.logger.info('Setting the following report suites on the tracker: "' +
        reportSuites + '"');
      tracker.sa(reportSuites);
    }
  }

  return tracker;
};

var getTrackerFromVariable = function(trackerVariableName) {
  if (window[trackerVariableName]) {
    turbine.logger.info('Found tracker located at: "' + trackerVariableName + '".');
    return window[trackerVariableName];
  } else {
    throw new Error('Cannot find the global variable name: "' + trackerVariableName + '".');
  }
};

// returns a promise that resolves with the tracker
module.exports = function(settings) {
  // loads all libraries from urls in parallel
  var loadLibraries = loadLibraryScripts(settings);

  // now setup the tracker
  switch (settings.libraryCode.type) {
    case settingsHelper.LIB_TYPES.MANAGED:
      var reportSuites = settingsHelper.getReportSuites(settings.libraryCode.accounts);
      return loadLibraries
        .then(createTracker.bind(null, settings, reportSuites));

    case settingsHelper.LIB_TYPES.PREINSTALLED:
      return loadLibraries
        .then(pollHelper.poll.bind(null, window, settings.libraryCode.trackerVariableName))
        .then(setReportSuitesOnTracker.bind(null, settings));

    case settingsHelper.LIB_TYPES.CUSTOM:
    case settingsHelper.LIB_TYPES.REMOTE:
      return loadLibraries
        .then(getTrackerFromVariable.bind(null, settings.libraryCode.trackerVariableName))
        .then(setReportSuitesOnTracker.bind(null, settings));

    default:
      throw new Error('Cannot load library. Type not supported.');

  }
};

          }

        },
        "adobe-analytics/src/lib/helpers/generateVersion.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

// The Launch code version is a 4 characters string.  The first character will always be L
// followed by year, month, and day codes.
// For example: JS-1.4.3-L53O = JS 1.4.3 code, Launch 2015 March 24th release (revision 1)
// More info: https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=tagmanager&title=DTM+Analytics+Code+Versions

'use strict';

var THIRD_OF_DAY = 8; //hours

var getDayField = function(date) {
  return date.getUTCDate().toString(36);
};

var getLastChar = function(str) {
  return str.substr(str.length - 1);
};

var getRevision = function(date) {
  // We are under the assumption that a Turbine version will be release at least 8h apart (max 3
  // releases per day).
  return Math.floor(date.getUTCHours() / THIRD_OF_DAY);
};

var getMonthField = function(date) {
  var monthNumber = date.getUTCMonth() + 1;
  var revision = getRevision(date);

  var monthField = (monthNumber + revision * 12).toString(36);

  return getLastChar(monthField);
};

var getYearField = function(date) {
  return (date.getUTCFullYear() - 2010).toString(36);
};

module.exports = function(dateString) {
  var date = new Date(dateString);

  if (isNaN(date)) {
    throw new Error('Invalid date provided');
  }

  return ('L' + getYearField(date) + getMonthField(date) + getDayField(date)).toUpperCase();
};

          }

        },
        "adobe-analytics/src/lib/helpers/pollHelper.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2020 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

var Promise = require('@adobe/reactor-promise');

var MAX_ITERATIONS = 40;
var INTERVAL = 250;

var found = function(resolve, variableName, result) {
  turbine.logger.info('Found property located at: "' + variableName + '"].');
  resolve(result);
};

var getPromise = function(object, variableName) {
  return new Promise(function(resolve, reject) {
    if (object[variableName]) {
      return found(resolve, variableName, object[variableName]);
    }
    var i = 1;
    var intervalId = setInterval(function() {
      if (object[variableName]) {
        found(resolve, variableName, object[variableName]);
        clearInterval(intervalId);
      }
      // give up after 10 seconds
      if (i >= MAX_ITERATIONS) {
        clearInterval(intervalId);
        reject(new Error(
          'Bailing out. Cannot find the variable name: "' + variableName + '"].'));
      }
      i++;
    }, INTERVAL); // every 1/4th second
  });
};

module.exports = {
  poll: function(object, variableName) {
    turbine.logger.info('Waiting for the property to become accessible at: "'
      + variableName + '"].');
    return getPromise(object, variableName);
  }
};

          }

        }
      }
    },
    "gcoe-adobe-client-data-layer": {
      "displayName": "Adobe Client Data Layer",
      "hostedLibFilesBaseUrl": "https://github.com/mydemosites/mydemosites.github.io/blob/main/adobe/dev/38e40b98b9df/b47210d3face/8f8f2c5d0445/hostedLibFiles/EP6e4c031a8b7640d7ac3fab013fa28b17/",
      "settings": {
        "dataLayerName": "adobeDataLayer",
        "injectLibrary": true
      },
      "modules": {
        "gcoe-adobe-client-data-layer/src/lib/dataElements/datalayerComputedState.js": {
          "name": "datalayer-computed-state",
          "displayName": "Data Layer Computed State",
          "script": function(module, exports, require, turbine) {
'use strict';
function index(obj, i) { return obj[i] }
/**
 * Returns the current computed state of the data layer.
 * @param settings Object containing the settings
 * @returns {Object|undefined}
 */
module.exports = function (settings, event) {
    if (typeof settings !== 'undefined' && settings !== null) {
        var dl = getDataLayer();
        if (typeof dl !== 'undefined') {
            if (settings.path !== '') {
                return dl.getState(settings.path);
            } else {
                return dl.getState();
            }
        }
    }
};

var getDataLayer = require('../util/getDataLayer');
          }

        },
        "gcoe-adobe-client-data-layer/src/lib/main.js": {
          "script": function(module, exports, require, turbine) {
var globalSettings = turbine.getExtensionSettings();
var dataLayerName = globalSettings.dataLayerName;
var injectLibrary = globalSettings.injectLibrary;

window.adobeDataLayer = window.adobeDataLayer || [];

/* if adobeDataLayer is not an object - change it */
if ('object' !== typeof (window.adobeDataLayer)) {
    turbine.logger.log('Initializing adobeDataLayer to [] as it isn\'t an object yet.');
    window.adobeDataLayer = [];
}

/* if a new name has been passed, ask adobeDataLayer to use it*/
if ('adobeDataLayer' !== dataLayerName) {
    if(typeof window[dataLayerName] === 'object') {
        turbine.logger.log('Using "' + dataLayerName + '" instead of "adobeDataLayer" as data layer name.');
        window.adobeDataLayer.push(function (dl) {
            // push existing events from window[dataLayerName] to adobeDataLayer
            for (var i = 0; i < window[dataLayerName].length; i++) {
                dl.push(window[dataLayerName][i]);
            }

            // set the reference of the existing data layer object to the new one
            window[dataLayerName] = dl
        });
    } else {
        turbine.logger.warn('Could not use "' + dataLayerName + '" instead of "adobeDataLayer", because the object does not exist!');
    }
}

if(injectLibrary) {
	/* Check if the wrapper ACDL is already loaded or not- check a specific function (getState) - USE CASE : Launch in AEM - AEM already loading ACDL*/
	if ("undefined" === typeof window.adobeDataLayer.getState) {
		turbine.logger.log('Initializing adobeDataLayer as it wasn\'t found during the initialization.');
        "use strict";function _slicedToArray(t,e){return _arrayWithHoles(t)||_iterableToArrayLimit(t,e)||_unsupportedIterableToArray(t,e)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _iterableToArrayLimit(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,a=void 0;try{for(var i,u=t[Symbol.iterator]();!(r=(i=u.next()).done)&&(n.push(i.value),!e||n.length!==e);r=!0);}catch(t){o=!0,a=t}finally{try{r||null==u.return||u.return()}finally{if(o)throw a}}return n}}function _arrayWithHoles(t){if(Array.isArray(t))return t}function _createForOfIteratorHelper(t){if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(t=_unsupportedIterableToArray(t))){var e=0,n=function(){};return{s:n,n:function(){return e>=t.length?{done:!0}:{done:!1,value:t[e++]}},e:function(t){throw t},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,o,a=!0,i=!1;return{s:function(){r=t[Symbol.iterator]()},n:function(){var t=r.next();return a=t.done,t},e:function(t){i=!0,o=t},f:function(){try{a||null==r.return||r.return()}finally{if(i)throw o}}}}function _unsupportedIterableToArray(t,e){if(t){if("string"==typeof t)return _arrayLikeToArray(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_arrayLikeToArray(t,e):void 0}}function _arrayLikeToArray(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}!function a(i,u,c){function f(e,t){if(!u[e]){if(!i[e]){var n="function"==typeof require&&require;if(!t&&n)return n(e,!0);if(s)return s(e,!0);var r=new Error("Cannot find module '"+e+"'");throw r.code="MODULE_NOT_FOUND",r}var o=u[e]={exports:{}};i[e][0].call(o.exports,function(t){return f(i[e][1][t]||t)},o,o.exports,a,i,u,c)}return u[e].exports}for(var s="function"==typeof require&&require,t=0;t<c.length;t++)f(c[t]);return f}({1:[function(t,wn,En){(function(On){(function(){function n(t,e){for(var n=-1,r=null==t?0:t.length,o=0,a=[];++n<r;){var i=t[n];e(i,n,t)&&(a[o++]=i)}return a}function a(t,e){for(var n=-1,r=null==t?0:t.length,o=Array(r);++n<r;)o[n]=e(t[n],n,t);return o}function f(t,e){for(var n=-1,r=e.length,o=t.length;++n<r;)t[o+n]=e[n];return t}function b(t,e){for(var n=-1,r=null==t?0:t.length;++n<r;)if(e(t[n],n,t))return!0;return!1}function o(t,e,n){var r=t.length;for(n+=-1;++n<r;)if(e(t[n],n,t))return n;return-1}function i(t){return t!=t}function t(e){return function(t){return e(t)}}function h(t){var n=-1,r=Array(t.size);return t.forEach(function(t,e){r[++n]=[e,t]}),r}function e(e){var n=Object;return function(t){return e(n(t))}}function v(t){var e=-1,n=Array(t.size);return t.forEach(function(t){n[++e]=t}),n}function r(){}function u(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function c(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function s(t){var e=-1,n=null==t?0:t.length;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function d(t){var e=-1,n=null==t?0:t.length;for(this.__data__=new s;++e<n;)this.add(t[e])}function g(t){this.size=(this.__data__=new c(t)).size}function l(t,e){var n=hn(t),r=!n&&bn(t),o=!n&&!r&&vn(t),a=!n&&!r&&!o&&_n(t);if(n=n||r||o||a){r=t.length;for(var i=String,u=-1,c=Array(r);++u<r;)c[u]=i(u);r=c}else r=[];var f;i=r.length;for(f in t)!e&&!be.call(t,f)||n&&("length"==f||o&&("offset"==f||"parent"==f)||a&&("buffer"==f||"byteLength"==f||"byteOffset"==f)||Q(f,i))||r.push(f);return r}function _(t,e,n){(n===Mt||ft(t[e],n))&&(n!==Mt||e in t)||j(t,e,n)}function y(t,e,n){var r=t[e];be.call(t,e)&&ft(r,n)&&(n!==Mt||e in t)||j(t,e,n)}function p(t,e){for(var n=t.length;n--;)if(ft(t[n][0],e))return n;return-1}function j(t,e,n){"__proto__"==e&&xe?xe(t,e,{configurable:!0,enumerable:!0,value:n,writable:!0}):t[e]=n}function m(n,r,o,t,e,a){var i,u=1&r,c=2&r,f=4&r;if(o&&(i=e?o(n,t,e,a):o(n)),i!==Mt)return i;if(!bt(n))return n;if(t=hn(n)){if(i=function(t){var e=t.length,n=new t.constructor(e);return e&&"string"==typeof t[0]&&be.call(t,"index")&&(n.index=t.index,n.input=t.input),n}(n),!u)return U(n,i)}else{var s=nn(n),l="[object Function]"==s||"[object GeneratorFunction]"==s;if(vn(n))return M(n,u);if("[object Object]"==s||"[object Arguments]"==s||l&&!e){if(i=c||l?{}:Y(n),!u)return c?function(t,e){return P(t,en(t),e)}(n,function(t,e){return t&&P(e,St(e),t)}(i,n)):function(t,e){return P(t,tn(t),e)}(n,function(t,e){return t&&P(e,Lt(e),t)}(i,n))}else{if(!Kt[s])return e?n:{};i=function(t,e,n){var r=t.constructor;switch(e){case"[object ArrayBuffer]":return z(t);case"[object Boolean]":case"[object Date]":return new r(+t);case"[object DataView]":return e=n?z(t.buffer):t.buffer,new t.constructor(e,t.byteOffset,t.byteLength);case"[object Float32Array]":case"[object Float64Array]":case"[object Int8Array]":case"[object Int16Array]":case"[object Int32Array]":case"[object Uint8Array]":case"[object Uint8ClampedArray]":case"[object Uint16Array]":case"[object Uint32Array]":return C(t,n);case"[object Map]":return new r;case"[object Number]":case"[object String]":return new r(t);case"[object RegExp]":return(e=new t.constructor(t.source,Ht.exec(t))).lastIndex=t.lastIndex,e;case"[object Set]":return new r;case"[object Symbol]":return qe?Object(qe.call(t)):{}}}(n,s,u)}}if(e=(a=a||new g).get(n))return e;if(a.set(n,i),gn(n))return n.forEach(function(t){i.add(m(t,r,o,t,n,a))}),i;if(dn(n))return n.forEach(function(t,e){i.set(e,m(t,r,o,e,n,a))}),i;c=f?c?B:H:c?St:Lt;var p=t?Mt:c(n);return function(t,e){for(var n=-1,r=null==t?0:t.length;++n<r&&!1!==e(t[n],n,t););}(p||n,function(t,e){p&&(t=n[e=t]),y(i,e,m(t,r,o,e,n,a))}),i}function A(t,e){for(var n=0,r=(e=F(e,t)).length;null!=t&&n<r;)t=t[nt(e[n++])];return n&&n==r?t:Mt}function O(t,e,n){return e=e(t),hn(t)?e:f(e,n(t))}function w(t){if(null==t)t=t===Mt?"[object Undefined]":"[object Null]";else if(Te&&Te in Object(t)){var e=be.call(t,Te),n=t[Te];try{t[Te]=Mt;var r=!0}catch(t){}var o=ve.call(t);r&&(e?t[Te]=n:delete t[Te]),t=o}else t=ve.call(t);return t}function E(t,e){return null!=t&&be.call(t,e)}function L(t,e){return null!=t&&e in Object(t)}function S(t){return ht(t)&&"[object Arguments]"==w(t)}function T(t,e,n,r,o){if(t===e)e=!0;else if(null==t||null==e||!ht(t)&&!ht(e))e=t!=t&&e!=e;else t:{var a,i,u=hn(t),c=hn(e),f="[object Object]"==(a="[object Arguments]"==(a=u?"[object Array]":nn(t))?"[object Object]":a);c="[object Object]"==(i="[object Arguments]"==(i=c?"[object Array]":nn(e))?"[object Object]":i);if((i=a==i)&&vn(t)){if(!vn(e)){e=!1;break t}f=!(u=!0)}if(i&&!f)o=o||new g,e=u||_n(t)?V(t,e,n,r,T,o):function(t,e,n,r,o,a,i){switch(n){case"[object DataView]":if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)break;t=t.buffer,e=e.buffer;case"[object ArrayBuffer]":if(t.byteLength!=e.byteLength||!a(new me(t),new me(e)))break;return!0;case"[object Boolean]":case"[object Date]":case"[object Number]":return ft(+t,+e);case"[object Error]":return t.name==e.name&&t.message==e.message;case"[object RegExp]":case"[object String]":return t==e+"";case"[object Map]":var u=h;case"[object Set]":if(u=u||v,t.size!=e.size&&!(1&r))break;return(n=i.get(t))?n==e:(r|=2,i.set(t,e),e=V(u(t),u(e),r,o,a,i),i.delete(t),e);case"[object Symbol]":if(qe)return qe.call(t)==qe.call(e)}return!1}(t,e,a,n,r,T,o);else{if(!(1&n)&&(u=f&&be.call(t,"__wrapped__"),a=c&&be.call(e,"__wrapped__"),u||a)){e=T(t=u?t.value():t,e=a?e.value():e,n,r,o=o||new g);break t}if(i)e:if(o=o||new g,u=1&n,a=H(t),c=a.length,i=H(e).length,c==i||u){for(f=c;f--;){var s=a[f];if(!(u?s in e:be.call(e,s))){e=!1;break e}}if((i=o.get(t))&&o.get(e))e=i==e;else{i=!0,o.set(t,e),o.set(e,t);for(var l=u;++f<c;){var p=t[s=a[f]],y=e[s];if(r)var b=u?r(y,p,s,e,t,o):r(p,y,s,t,e,o);if(b===Mt?p!==y&&!T(p,y,n,r,o):!b){i=!1;break}l=l||"constructor"==s}i&&!l&&((n=t.constructor)!=(r=e.constructor)&&"constructor"in t&&"constructor"in e&&!("function"==typeof n&&n instanceof n&&"function"==typeof r&&r instanceof r)&&(i=!1)),o.delete(t),o.delete(e),e=i}}else e=!1;else e=!1}}return e}function x(t){return"function"==typeof t?t:null==t?It:"object"==_typeof(t)?hn(t)?function(n,r){return X(n)&&r==r&&!bt(r)?tt(nt(n),r):function(t){var e=wt(t,n);return e===Mt&&e===r?Et(t,n):T(r,e,3)}}(t[0],t[1]):function(e){var n=function(t){for(var e=Lt(t),n=e.length;n--;){var r=e[n],o=t[r];e[n]=[r,o,o==o&&!bt(o)]}return e}(e);return 1==n.length&&n[0][2]?tt(n[0][0],n[0][1]):function(t){return t===e||function(t,e){var n=e.length,r=n;if(null==t)return!r;for(t=Object(t);n--;){if((o=e[n])[2]?o[1]!==t[o[0]]:!(o[0]in t))return!1}for(;++n<r;){var o,a=(o=e[n])[0],i=t[a],u=o[1];if(o[2]){if(i===Mt&&!(a in t))return!1}else if(o=new g,void 0!==Mt||!T(u,i,3,void 0,o))return!1}return!0}(t,n)}}(t):Nt(t)}function I(t){if(!Z(t))return Ne(t);var e,n=[];for(e in Object(t))be.call(t,e)&&"constructor"!=e&&n.push(e);return n}function k(s,l,p,y,b){s!==l&&Xe(l,function(t,e){if(bt(t)){var n=b=b||new g,r="__proto__"==e?Mt:s[e],o="__proto__"==e?Mt:l[e];if(f=n.get(o))_(s,e,f);else{var a=(f=y?y(r,o,e+"",s,l,n):Mt)===Mt;if(a){var i=hn(o),u=!i&&vn(o),c=!i&&!u&&_n(o),f=o;i||u||c?f=hn(r)?r:lt(r)?U(r):u?M(o,!(a=!1)):c?C(o,!(a=!1)):[]:vt(o)||bn(o)?bn(f=r)?f=At(r):(!bt(r)||p&&pt(r))&&(f=Y(o)):a=!1}a&&(n.set(o,f),k(f,o,p,y,n),n.delete(o)),_(s,e,f)}}else(n=y?y("__proto__"==e?Mt:s[e],t,e+"",s,l,b):Mt)===Mt&&(n=t),_(s,e,n)},St)}function N(t){if("string"==typeof t)return t;if(hn(t))return a(t,N)+"";if(gt(t))return Je?Je.call(t):"";var e=t+"";return"0"==e&&1/t==-zt?"-0":e}function D(t,e){var n;if((e=F(e,t)).length<2)n=t;else{var r=0,o=-1,a=-1,i=(n=e).length;for(r<0&&(r=i<-r?0:i+r),(o=i<o?i:o)<0&&(o+=i),i=o<r?0:o-r>>>0,r>>>=0,o=Array(i);++a<i;)o[a]=n[a+r];n=A(t,o)}null==(t=n)||delete t[nt(it(e))]}function F(t,e){return hn(t)?t:X(t,e)?[t]:ln(Ot(t))}function M(t,e){if(e)return t.slice();var n=t.length;n=Ae?Ae(n):new t.constructor(n);return t.copy(n),n}function z(t){var e=new t.constructor(t.byteLength);return new me(e).set(new me(t)),e}function C(t,e){return new t.constructor(e?z(t.buffer):t.buffer,t.byteOffset,t.length)}function U(t,e){var n=-1,r=t.length;for(e=e||Array(r);++n<r;)e[n]=t[n];return e}function P(t,e,n){var r=!n;n=n||{};for(var o=-1,a=e.length;++o<a;){var i=e[o],u=Mt;u===Mt&&(u=t[i]),r?j(n,i,u):y(n,i,u)}return n}function R(f){return function(t){return sn(et(t,void 0,It),t+"")}(function(t,e){var n,r=-1,o=e.length,a=1<o?e[o-1]:Mt,i=2<o?e[2]:Mt;a=3<f.length&&"function"==typeof a?(o--,a):Mt;if(n=i){n=e[0];var u=e[1];if(bt(i)){var c=_typeof(u);n=!!("number"==c?st(i)&&Q(u,i.length):"string"==c&&u in i)&&ft(i[u],n)}else n=!1}for(n&&(a=o<3?Mt:a,o=1),t=Object(t);++r<o;)(i=e[r])&&f(t,i,r,a);return t})}function $(t){return vt(t)?Mt:t}function V(t,e,n,r,o,a){var i=1&n,u=t.length;if(u!=(c=e.length)&&!(i&&u<c))return!1;if((c=a.get(t))&&a.get(e))return c==e;var c=-1,f=!0,s=2&n?new d:Mt;for(a.set(t,e),a.set(e,t);++c<u;){var l=t[c],p=e[c];if(r)var y=i?r(p,l,c,e,t,a):r(l,p,c,t,e,a);if(y!==Mt){if(y)continue;f=!1;break}if(s){if(!b(e,function(t,e){if(!s.has(e)&&(l===t||o(l,t,n,r,a)))return s.push(e)})){f=!1;break}}else if(l!==p&&!o(l,p,n,r,a)){f=!1;break}}return a.delete(t),a.delete(e),f}function H(t){return O(t,Lt,tn)}function B(t){return O(t,St,en)}function W(t,e){var n=(n=r.iteratee||kt)===kt?x:n;return arguments.length?n(t,e):n}function G(t,e){var n=t.__data__,r=_typeof(e);return("string"==r||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==e:null===e)?n["string"==typeof e?"string":"hash"]:n.map}function q(t,e){var n=null==t?Mt:t[e];return!bt(n)||he&&he in n||!(pt(n)?ge:Gt).test(rt(n))?Mt:n}function J(t,e,n){for(var r=-1,o=(e=F(e,t)).length,a=!1;++r<o;){var i=nt(e[r]);if(!(a=null!=t&&n(t,i)))break;t=t[i]}return a||++r!=o?a:!!(o=null==t?0:t.length)&&yt(o)&&Q(i,o)&&(hn(t)||bn(t))}function Y(t){return"function"!=typeof t.constructor||Z(t)?{}:Ye(Oe(t))}function K(t){return hn(t)||bn(t)||!!(Se&&t&&t[Se])}function Q(t,e){var n=_typeof(t);return!!(e=null==e?9007199254740991:e)&&("number"==n||"symbol"!=n&&Jt.test(t))&&-1<t&&0==t%1&&t<e}function X(t,e){if(hn(t))return!1;var n=_typeof(t);return!("number"!=n&&"symbol"!=n&&"boolean"!=n&&null!=t&&!gt(t))||Pt.test(t)||!Ut.test(t)||null!=e&&t in Object(e)}function Z(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||le)}function tt(e,n){return function(t){return null!=t&&t[e]===n&&(n!==Mt||e in Object(t))}}function et(o,a,i){return a=De(a===Mt?o.length-1:a,0),function(){for(var t=arguments,e=-1,n=De(t.length-a,0),r=Array(n);++e<n;)r[e]=t[a+e];for(e=-1,n=Array(a+1);++e<a;)n[e]=t[e];return n[a]=i(r),function(t,e,n){switch(n.length){case 0:return t.call(e);case 1:return t.call(e,n[0]);case 2:return t.call(e,n[0],n[1]);case 3:return t.call(e,n[0],n[1],n[2])}return t.apply(e,n)}(o,this,n)}}function nt(t){if("string"==typeof t||gt(t))return t;var e=t+"";return"0"==e&&1/t==-zt?"-0":e}function rt(t){if(null==t)return"";try{return ye.call(t)}catch(t){}return t+""}function ot(t,e,n){var r=null==t?0:t.length;return r?((n=null==n?0:jt(n))<0&&(n=De(r+n,0)),o(t,W(e,3),n)):-1}function at(t){return null!=t&&t.length?function t(e,n,r,o,a){var i=-1,u=e.length;for(r=r||K,a=a||[];++i<u;){var c=e[i];0<n&&r(c)?1<n?t(c,n-1,r,o,a):f(a,c):o||(a[a.length]=c)}return a}(t,1):[]}function it(t){var e=null==t?0:t.length;return e?t[e-1]:Mt}function ut(r,o){function a(){var t=arguments,e=o?o.apply(this,t):t[0],n=a.cache;return n.has(e)?n.get(e):(t=r.apply(this,t),a.cache=n.set(e,t)||n,t)}if("function"!=typeof r||null!=o&&"function"!=typeof o)throw new TypeError("Expected a function");return a.cache=new(ut.Cache||s),a}function ct(e){if("function"!=typeof e)throw new TypeError("Expected a function");return function(){var t=arguments;switch(t.length){case 0:return!e.call(this);case 1:return!e.call(this,t[0]);case 2:return!e.call(this,t[0],t[1]);case 3:return!e.call(this,t[0],t[1],t[2])}return!e.apply(this,t)}}function ft(t,e){return t===e||t!=t&&e!=e}function st(t){return null!=t&&yt(t.length)&&!pt(t)}function lt(t){return ht(t)&&st(t)}function pt(t){return!!bt(t)&&("[object Function]"==(t=w(t))||"[object GeneratorFunction]"==t||"[object AsyncFunction]"==t||"[object Proxy]"==t)}function yt(t){return"number"==typeof t&&-1<t&&0==t%1&&t<=9007199254740991}function bt(t){var e=_typeof(t);return null!=t&&("object"==e||"function"==e)}function ht(t){return null!=t&&"object"==_typeof(t)}function vt(t){return!(!ht(t)||"[object Object]"!=w(t))&&(null===(t=Oe(t))||"function"==typeof(t=be.call(t,"constructor")&&t.constructor)&&t instanceof t&&ye.call(t)==de)}function dt(t){return"string"==typeof t||!hn(t)&&ht(t)&&"[object String]"==w(t)}function gt(t){return"symbol"==_typeof(t)||ht(t)&&"[object Symbol]"==w(t)}function _t(t){return t?(t=mt(t))===zt||t===-zt?17976931348623157e292*(t<0?-1:1):t==t?t:0:0===t?t:0}function jt(t){var e=(t=_t(t))%1;return t==t?e?t-e:t:0}function mt(t){if("number"==typeof t)return t;if(gt(t))return Ct;if(bt(t)&&(t=bt(t="function"==typeof t.valueOf?t.valueOf():t)?t+"":t),"string"!=typeof t)return 0===t?t:+t;t=t.replace($t,"");var e=Wt.test(t);return e||qt.test(t)?Xt(t.slice(2),e?2:8):Bt.test(t)?Ct:+t}function At(t){return P(t,St(t))}function Ot(t){return null==t?"":N(t)}function wt(t,e,n){return(t=null==t?Mt:A(t,e))===Mt?n:t}function Et(t,e){return null!=t&&J(t,e,L)}function Lt(t){return st(t)?l(t):I(t)}function St(t){if(st(t))t=l(t,!0);else if(bt(t)){var e,n=Z(t),r=[];for(e in t)("constructor"!=e||!n&&be.call(t,e))&&r.push(e);t=r}else{if(e=[],null!=t)for(n in Object(t))e.push(n);t=e}return t}function Tt(t){return null==t?[]:function(e,t){return a(t,function(t){return e[t]})}(t,Lt(t))}function xt(t){return function(){return t}}function It(t){return t}function kt(t){return x("function"==typeof t?t:m(t,1))}function Nt(t){return X(t)?function(e){return function(t){return null==t?Mt:t[e]}}(nt(t)):function(e){return function(t){return A(t,e)}}(t)}function Dt(){return[]}function Ft(){return!1}var Mt,zt=1/0,Ct=NaN,Ut=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Pt=/^\w*$/,Rt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,$t=/^\s+|\s+$/g,Vt=/\\(\\)?/g,Ht=/\w*$/,Bt=/^[-+]0x[0-9a-f]+$/i,Wt=/^0b[01]+$/i,Gt=/^\[object .+?Constructor\]$/,qt=/^0o[0-7]+$/i,Jt=/^(?:0|[1-9]\d*)$/,Yt={};Yt["[object Float32Array]"]=Yt["[object Float64Array]"]=Yt["[object Int8Array]"]=Yt["[object Int16Array]"]=Yt["[object Int32Array]"]=Yt["[object Uint8Array]"]=Yt["[object Uint8ClampedArray]"]=Yt["[object Uint16Array]"]=Yt["[object Uint32Array]"]=!0,Yt["[object Arguments]"]=Yt["[object Array]"]=Yt["[object ArrayBuffer]"]=Yt["[object Boolean]"]=Yt["[object DataView]"]=Yt["[object Date]"]=Yt["[object Error]"]=Yt["[object Function]"]=Yt["[object Map]"]=Yt["[object Number]"]=Yt["[object Object]"]=Yt["[object RegExp]"]=Yt["[object Set]"]=Yt["[object String]"]=Yt["[object WeakMap]"]=!1;var Kt={};Kt["[object Arguments]"]=Kt["[object Array]"]=Kt["[object ArrayBuffer]"]=Kt["[object DataView]"]=Kt["[object Boolean]"]=Kt["[object Date]"]=Kt["[object Float32Array]"]=Kt["[object Float64Array]"]=Kt["[object Int8Array]"]=Kt["[object Int16Array]"]=Kt["[object Int32Array]"]=Kt["[object Map]"]=Kt["[object Number]"]=Kt["[object Object]"]=Kt["[object RegExp]"]=Kt["[object Set]"]=Kt["[object String]"]=Kt["[object Symbol]"]=Kt["[object Uint8Array]"]=Kt["[object Uint8ClampedArray]"]=Kt["[object Uint16Array]"]=Kt["[object Uint32Array]"]=!0,Kt["[object Error]"]=Kt["[object Function]"]=Kt["[object WeakMap]"]=!1;var Qt,Xt=parseInt,Zt="object"==_typeof(On)&&On&&On.Object===Object&&On,te="object"==("undefined"==typeof self?"undefined":_typeof(self))&&self&&self.Object===Object&&self,ee=Zt||te||Function("return this")(),ne="object"==_typeof(En)&&En&&!En.nodeType&&En,re=ne&&"object"==_typeof(wn)&&wn&&!wn.nodeType&&wn,oe=re&&re.exports===ne,ae=oe&&Zt.process;t:{try{Qt=ae&&ae.binding&&ae.binding("util");break t}catch(t){}Qt=void 0}var ie,ue=Qt&&Qt.isMap,ce=Qt&&Qt.isSet,fe=Qt&&Qt.isTypedArray,se=Array.prototype,le=Object.prototype,pe=ee["__core-js_shared__"],ye=Function.prototype.toString,be=le.hasOwnProperty,he=(ie=/[^.]+$/.exec(pe&&pe.keys&&pe.keys.IE_PROTO||""))?"Symbol(src)_1."+ie:"",ve=le.toString,de=ye.call(Object),ge=RegExp("^"+ye.call(be).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),_e=oe?ee.Buffer:Mt,je=ee.Symbol,me=ee.Uint8Array,Ae=_e?_e.a:Mt,Oe=e(Object.getPrototypeOf),we=Object.create,Ee=le.propertyIsEnumerable,Le=se.splice,Se=je?je.isConcatSpreadable:Mt,Te=je?je.toStringTag:Mt,xe=function(){try{var t=q(Object,"defineProperty");return t({},"",{}),t}catch(t){}}(),Ie=Object.getOwnPropertySymbols,ke=_e?_e.isBuffer:Mt,Ne=e(Object.keys),De=Math.max,Fe=Date.now,Me=q(ee,"DataView"),ze=q(ee,"Map"),Ce=q(ee,"Promise"),Ue=q(ee,"Set"),Pe=q(ee,"WeakMap"),Re=q(Object,"create"),$e=rt(Me),Ve=rt(ze),He=rt(Ce),Be=rt(Ue),We=rt(Pe),Ge=je?je.prototype:Mt,qe=Ge?Ge.valueOf:Mt,Je=Ge?Ge.toString:Mt,Ye=function(t){return bt(t)?we?we(t):(Ke.prototype=t,t=new Ke,Ke.prototype=Mt,t):{}};function Ke(){}u.prototype.clear=function(){this.__data__=Re?Re(null):{},this.size=0},u.prototype.delete=function(t){return t=this.has(t)&&delete this.__data__[t],this.size-=t?1:0,t},u.prototype.get=function(t){var e=this.__data__;return Re?"__lodash_hash_undefined__"===(t=e[t])?Mt:t:be.call(e,t)?e[t]:Mt},u.prototype.has=function(t){var e=this.__data__;return Re?e[t]!==Mt:be.call(e,t)},u.prototype.set=function(t,e){var n=this.__data__;return this.size+=this.has(t)?0:1,n[t]=Re&&e===Mt?"__lodash_hash_undefined__":e,this},c.prototype.clear=function(){this.__data__=[],this.size=0},c.prototype.delete=function(t){var e=this.__data__;return!((t=p(e,t))<0||(t==e.length-1?e.pop():Le.call(e,t,1),--this.size,0))},c.prototype.get=function(t){var e=this.__data__;return(t=p(e,t))<0?Mt:e[t][1]},c.prototype.has=function(t){return-1<p(this.__data__,t)},c.prototype.set=function(t,e){var n=this.__data__,r=p(n,t);return r<0?(++this.size,n.push([t,e])):n[r][1]=e,this},s.prototype.clear=function(){this.size=0,this.__data__={hash:new u,map:new(ze||c),string:new u}},s.prototype.delete=function(t){return t=G(this,t).delete(t),this.size-=t?1:0,t},s.prototype.get=function(t){return G(this,t).get(t)},s.prototype.has=function(t){return G(this,t).has(t)},s.prototype.set=function(t,e){var n=G(this,t),r=n.size;return n.set(t,e),this.size+=n.size==r?0:1,this},d.prototype.add=d.prototype.push=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},d.prototype.has=function(t){return this.__data__.has(t)},g.prototype.clear=function(){this.__data__=new c,this.size=0},g.prototype.delete=function(t){var e=this.__data__;return t=e.delete(t),this.size=e.size,t},g.prototype.get=function(t){return this.__data__.get(t)},g.prototype.has=function(t){return this.__data__.has(t)},g.prototype.set=function(t,e){var n=this.__data__;if(n instanceof c){var r=n.__data__;if(!ze||r.length<199)return r.push([t,e]),this.size=++n.size,this;n=this.__data__=new s(r)}return n.set(t,e),this.size=n.size,this};var Qe=function(t,e){if(null==t)return t;if(!st(t))return function(t,e){return t&&Xe(t,e,Lt)}(t,e);for(var n=t.length,r=-1,o=Object(t);++r<n&&!1!==e(o[r],r,o););return t},Xe=function(t,e,n){for(var r=-1,o=Object(t),a=(n=n(t)).length;a--;){var i=n[++r];if(!1===e(o[i],i,o))break}return t},Ze=xe?function(t,e){return xe(t,"toString",{configurable:!0,enumerable:!1,value:xt(e),writable:!0})}:It,tn=Ie?function(e){return null==e?[]:(e=Object(e),n(Ie(e),function(t){return Ee.call(e,t)}))}:Dt,en=Ie?function(t){for(var e=[];t;)f(e,tn(t)),t=Oe(t);return e}:Dt,nn=w;(Me&&"[object DataView]"!=nn(new Me(new ArrayBuffer(1)))||ze&&"[object Map]"!=nn(new ze)||Ce&&"[object Promise]"!=nn(Ce.resolve())||Ue&&"[object Set]"!=nn(new Ue)||Pe&&"[object WeakMap]"!=nn(new Pe))&&(nn=function(t){var e=w(t);if(t=(t="[object Object]"==e?t.constructor:Mt)?rt(t):"")switch(t){case $e:return"[object DataView]";case Ve:return"[object Map]";case He:return"[object Promise]";case Be:return"[object Set]";case We:return"[object WeakMap]"}return e});var rn,on,an,un,cn,fn,sn=(un=Ze,fn=cn=0,function(){var t=Fe(),e=16-(t-fn);if(fn=t,0<e){if(800<=++cn)return arguments[0]}else cn=0;return un.apply(Mt,arguments)}),ln=(an=(on=ut(on=function(t){var o=[];return 46===t.charCodeAt(0)&&o.push(""),t.replace(Rt,function(t,e,n,r){o.push(n?r.replace(Vt,"$1"):e||t)}),o},function(t){return 500===an.size&&an.clear(),t})).cache,on),pn=(rn=ot,function(t,e,n){var r=Object(t);if(!st(t)){var o=W(e,3);t=Lt(t),e=function(t){return o(r[t],t,r)}}return-1<(e=rn(t,e,n))?r[o?t[e]:e]:Mt});ut.Cache=s;var yn,bn=S(function(){return arguments}())?S:function(t){return ht(t)&&be.call(t,"callee")&&!Ee.call(t,"callee")},hn=Array.isArray,vn=ke||Ft,dn=ue?t(ue):function(t){return ht(t)&&"[object Map]"==nn(t)},gn=ce?t(ce):function(t){return ht(t)&&"[object Set]"==nn(t)},_n=fe?t(fe):function(t){return ht(t)&&yt(t.length)&&!!Yt[w(t)]},jn=R(function(t,e,n){k(t,e,n)}),mn=R(function(t,e,n,r){k(t,e,n,r)}),An=sn(et(yn=function(e,t){var n={};if(null==e)return n;var r=!1;t=a(t,function(t){return t=F(t,e),r=r||1<t.length,t}),P(e,B(e),n),r&&(n=m(n,7,$));for(var o=t.length;o--;)D(n,t[o]);return n},Mt,at),yn+"");r.constant=xt,r.flatten=at,r.iteratee=kt,r.keys=Lt,r.keysIn=St,r.memoize=ut,r.merge=jn,r.mergeWith=mn,r.negate=ct,r.omit=An,r.property=Nt,r.reject=function(t,e){return(hn(t)?n:function(t,r){var o=[];return Qe(t,function(t,e,n){r(t,e,n)&&o.push(t)}),o})(t,ct(W(e,3)))},r.toPlainObject=At,r.values=Tt,r.cloneDeep=function(t){return m(t,5)},r.cloneDeepWith=function(t,e){return m(t,5,e="function"==typeof e?e:Mt)},r.eq=ft,r.find=pn,r.findIndex=ot,r.get=wt,r.has=function(t,e){return null!=t&&J(t,e,E)},r.hasIn=Et,r.identity=It,r.includes=function(t,e,n,r){if(t=st(t)?t:Tt(t),n=n&&!r?jt(n):0,r=t.length,n<0&&(n=De(r+n,0)),dt(t))t=n<=r&&-1<t.indexOf(e,n);else{if(r=!!r){if(e==e)t:{for(n-=1,r=t.length;++n<r;)if(t[n]===e){t=n;break t}t=-1}else t=o(t,i,n);r=-1<t}t=r}return t},r.isArguments=bn,r.isArray=hn,r.isArrayLike=st,r.isArrayLikeObject=lt,r.isBuffer=vn,r.isEmpty=function(t){if(null==t)return!0;if(st(t)&&(hn(t)||"string"==typeof t||"function"==typeof t.splice||vn(t)||_n(t)||bn(t)))return!t.length;var e=nn(t);if("[object Map]"==e||"[object Set]"==e)return!t.size;if(Z(t))return!I(t).length;for(var n in t)if(be.call(t,n))return!1;return!0},r.isEqual=function(t,e){return T(t,e)},r.isFunction=pt,r.isLength=yt,r.isMap=dn,r.isNull=function(t){return null===t},r.isObject=bt,r.isObjectLike=ht,r.isPlainObject=vt,r.isSet=gn,r.isString=dt,r.isSymbol=gt,r.isTypedArray=_n,r.last=it,r.stubArray=Dt,r.stubFalse=Ft,r.toFinite=_t,r.toInteger=jt,r.toNumber=mt,r.toString=Ot,r.VERSION="4.17.5",re&&((re.exports=r)._=r,ne._=r)}).call(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],2:[function(t,e,n){e.exports={itemType:{DATA:"data",FCTN:"fctn",EVENT:"event",LISTENER_ON:"listenerOn",LISTENER_OFF:"listenerOff"},dataLayerEvent:{CHANGE:"adobeDataLayer:change",EVENT:"adobeDataLayer:event"},listenerScope:{PAST:"past",FUTURE:"future",ALL:"all"}}},{}],3:[function(t,e,n){var r=t("../custom-lodash"),c=t("../version.json").version,l=r.cloneDeep,p=r.get,y=t("./item"),b=t("./listener"),h=t("./listenerManager"),v=t("./constants"),d=t("./utils/customMerge");e.exports=function(t){var f,e=t||{},n=[],r=[],o={},a={getState:function(){return o},getDataLayer:function(){return n}};function i(t){o=d(o,t.data)}function u(t){t.valid?{data:function(t){i(t),f.triggerListeners(t)},fctn:function(t){t.config.call(n,n)},event:function(t){t.data&&i(t),f.triggerListeners(t)},listenerOn:function(t){var e=b(t);switch(e.scope){case v.listenerScope.PAST:var n,r=_createForOfIteratorHelper(c(t));try{for(r.s();!(n=r.n()).done;){var o=n.value;f.triggerListener(e,o)}}catch(t){r.e(t)}finally{r.f()}break;case v.listenerScope.FUTURE:f.register(e);break;case v.listenerScope.ALL:if(f.register(e)){var a,i=_createForOfIteratorHelper(c(t));try{for(i.s();!(a=i.n()).done;){var u=a.value;f.triggerListener(e,u)}}catch(t){i.e(t)}finally{i.f()}}}},listenerOff:function(t){f.unregister(b(t))}}[t.type](t):s(t);function c(t){return 0===n.length||t.index>n.length-1?[]:n.slice(0,t.index).map(function(t){return y(t)})}}function s(t){var e="The following item cannot be handled by the data layer because it does not have a valid format: "+JSON.stringify(t.config);console.error(e)}return function(){Array.isArray(e.dataLayer)||(e.dataLayer=[]);r=e.dataLayer.splice(0,e.dataLayer.length),(n=e.dataLayer).version=c,o={},f=h(a)}(),n.push=function(t){var n=arguments,r=arguments;if(Object.keys(n).forEach(function(t){var e=y(n[t]);switch(e.valid||(s(e),delete r[t]),e.type){case v.itemType.DATA:case v.itemType.EVENT:u(e);break;case v.itemType.FCTN:delete r[t],u(e);break;case v.itemType.LISTENER_ON:case v.itemType.LISTENER_OFF:delete r[t]}}),r[0])return Array.prototype.push.apply(this,r)},n.getState=function(t){return t?p(l(o),t):l(o)},n.addEventListener=function(t,e,n){u(y({on:t,handler:e,scope:n&&n.scope,path:n&&n.path}))},n.removeEventListener=function(t,e){u(y({off:t,handler:e}))},function(){for(var t=0;t<r.length;t++)n.push(r[t])}(),a}},{"../custom-lodash":1,"../version.json":14,"./constants":2,"./item":5,"./listener":7,"./listenerManager":8,"./utils/customMerge":10}],4:[function(t,e,n){var r={Manager:t("./dataLayerManager")};window.adobeDataLayer=window.adobeDataLayer||[],window.adobeDataLayer.version?console.warn("Adobe Client Data Layer v".concat(window.adobeDataLayer.version," has already been imported/initialized on this page. You may be erroneously loading it a second time.")):r.Manager({dataLayer:window.adobeDataLayer}),e.exports=r},{"./dataLayerManager":3}],5:[function(t,e,n){var r=t("../custom-lodash"),i=r.isPlainObject,u=r.isEmpty,c=r.omit,f=r.find,s=t("./utils/dataMatchesContraints"),l=t("./itemConstraints"),p=t("./constants");e.exports=function(t,e){var n=t,r=e,o=f(Object.keys(l),function(t){return s(n,l[t])})||"function"==typeof n&&p.itemType.FCTN||i(n)&&p.itemType.DATA,a=function(){var t=c(n,Object.keys(l.event));if(!u(t))return t}();return{config:n,type:o,data:a,valid:!!o,index:r}}},{"../custom-lodash":1,"./constants":2,"./itemConstraints":6,"./utils/dataMatchesContraints":11}],6:[function(t,e,n){e.exports={event:{event:{type:"string"},eventInfo:{optional:!0}},listenerOn:{on:{type:"string"},handler:{type:"function"},scope:{type:"string",values:["past","future","all"],optional:!0},path:{type:"string",optional:!0}},listenerOff:{off:{type:"string"},handler:{type:"function",optional:!0},scope:{type:"string",values:["past","future","all"],optional:!0},path:{type:"string",optional:!0}}}},{}],7:[function(t,e,n){var r=t("./constants");e.exports=function(t){return{event:t.config.on||t.config.off,handler:t.config.handler||null,scope:t.config.scope||t.config.on&&r.listenerScope.ALL||null,path:t.config.path||null}}},{"./constants":2}],8:[function(t,e,n){var u=t("../custom-lodash").cloneDeep,c=t("./constants"),f=t("./utils/listenerMatch"),s=t("./utils/indexOfListener");e.exports=function(t){var o={},r=t,a=s.bind(null,o);function i(t,e){if(f(t,e)){var n=[u(e.config)];t.handler.apply(r.getDataLayer(),n)}}return{register:function(t){var e=t.event;return Object.prototype.hasOwnProperty.call(o,e)?-1===a(t)&&(o[t.event].push(t),!0):(o[t.event]=[t],!0)},unregister:function(t){var e=t.event;if(Object.prototype.hasOwnProperty.call(o,e))if(t.handler||t.scope||t.path){var n=a(t);-1<n&&o[e].splice(n,1)}else o[e]=[]},triggerListeners:function(r){(function(t){var e=[];switch(t.type){case c.itemType.DATA:e.push(c.dataLayerEvent.CHANGE);break;case c.itemType.EVENT:e.push(c.dataLayerEvent.EVENT),t.data&&e.push(c.dataLayerEvent.CHANGE),t.config.event!==c.dataLayerEvent.CHANGE&&e.push(t.config.event)}return e})(r).forEach(function(t){if(Object.prototype.hasOwnProperty.call(o,t)){var e,n=_createForOfIteratorHelper(o[t]);try{for(n.s();!(e=n.n()).done;){i(e.value,r)}}catch(t){n.e(t)}finally{n.f()}}})},triggerListener:function(t,e){i(t,e)}}}},{"../custom-lodash":1,"./constants":2,"./utils/indexOfListener":12,"./utils/listenerMatch":13}],9:[function(t,e,n){var r=t("../../custom-lodash"),o=r.has,a=r.get;e.exports=function(t,e){for(var n=e.substring(0,e.lastIndexOf("."));n;){if(o(t,n)){var r=a(t,n);if(null==r)return!0}n=n.substring(0,n.lastIndexOf("."))}return!1}},{"../../custom-lodash":1}],10:[function(t,e,n){var r=t("../../custom-lodash"),s=r.cloneDeepWith,l=r.isObject,p=r.isArray,y=r.reject,o=r.mergeWith,a=r.isNull;e.exports=function(t,e){return o(t,e,function(t,e,n,r){if(null==e)return null}),t=function(t,e){return s(t,function(f){return function e(t,n,r,o){if(l(t)){if(p(t))return y(t,f).map(function(t){return s(t,e)});for(var a={},i=0,u=Object.keys(t);i<u.length;i++){var c=u[i];f(t[c])||(a[c]=s(t[c],e))}return a}}}(1<arguments.length&&void 0!==e?e:function(t){return!t}))}(t,a)}},{"../../custom-lodash":1}],11:[function(t,e,n){var r=t("../../custom-lodash"),o=r.find,s=r.includes;e.exports=function(c,f){return void 0===o(Object.keys(f),function(t){var e=f[t].type,n=t&&f[t].values,r=!f[t].optional,o=c[t],a=_typeof(o),i=e&&a!==e,u=n&&!s(n,o);return r?!o||i||u:o&&(i||u)})}},{"../../custom-lodash":1}],12:[function(t,e,n){var c=t("../../custom-lodash").isEqual;e.exports=function(t,e){var n=e.event;if(Object.prototype.hasOwnProperty.call(t,n)){var r,o=_createForOfIteratorHelper(t[n].entries());try{for(o.s();!(r=o.n()).done;){var a=_slicedToArray(r.value,2),i=a[0],u=a[1];if(c(u.handler,e.handler))return i}}catch(t){o.e(t)}finally{o.f()}}return-1}},{"../../custom-lodash":1}],13:[function(t,e,n){var r=t("../../custom-lodash").has,a=t("../constants"),o=t("./ancestorRemoved");function i(t,e){return!e.data||!t.path||(r(e.data,t.path)||o(e.data,t.path))}e.exports=function(t,e){var n=t.event,r=e.config,o=!1;return e.type===a.itemType.DATA?n===a.dataLayerEvent.CHANGE&&(o=i(t,e)):e.type===a.itemType.EVENT&&(n!==a.dataLayerEvent.EVENT&&n!==r.event||(o=i(t,e)),e.data&&n===a.dataLayerEvent.CHANGE&&(o=i(t,e))),o}},{"../../custom-lodash":1,"../constants":2,"./ancestorRemoved":9}],14:[function(t,e,n){e.exports={version:"2.0.2"}},{}]},{},[4]);
	}
}
          }

        },
        "gcoe-adobe-client-data-layer/src/lib/util/getDataLayer.js": {
          "script": function(module, exports, require, turbine) {
'use strict';

/**
 * Returns the Adobe Client Data Layer, based on the extension configuration.
 * @returns {Object|undefined}
 */
module.exports = function () {
    var extensionSettings = turbine.getExtensionSettings();
    return window[extensionSettings.dataLayerName];
};
          }

        }
      }
    },
    "core": {
      "displayName": "Core",
      "hostedLibFilesBaseUrl": "https://github.com/mydemosites/mydemosites.github.io/blob/main/adobe/dev/38e40b98b9df/b47210d3face/8f8f2c5d0445/hostedLibFiles/EPd22815afd48447aa955be6a3a012e3b5/",
      "modules": {
      }
    },
    "adobe-mcid": {
      "displayName": "Experience Cloud ID Service",
      "hostedLibFilesBaseUrl": "https://github.com/mydemosites/mydemosites.github.io/blob/main/adobe/dev/38e40b98b9df/b47210d3face/8f8f2c5d0445/hostedLibFiles/EPbdfb4b2e3570442dafcd49b858f2288a/",
      "settings": {
        "orgId": "0B96B03459707BE40A495C70@AdobeOrg",
        "variables": [
          {
            "name": "trackingServer",
            "value": "ageo1xxpnwactivate.sc.omtrdc.net"
          },
          {
            "name": "trackingServerSecure",
            "value": "ageo1xxpnwactivate.sc.omtrdc.net"
          }
        ]
      },
      "modules": {
        "adobe-mcid/src/lib/sharedModules/mcidInstance.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';
var document = require('@adobe/reactor-document');
var VisitorAPI = require('../codeLibrary/VisitorAPI');
var timeUnits = require('../../view/utils/timeUnits');

var transformArrayToObject = function(configs) {
  var initConfig = configs.reduce(function(obj, config) {
    var value = /^(true|false)$/i.test(config.value) ? JSON.parse(config.value) : config.value;

    obj[config.name] = value;

    return obj;
  }, {});

  return initConfig;
};

var initializeVisitorId = function(Visitor) {
  var extensionSettings = turbine.getExtensionSettings();
  if (typeof extensionSettings.orgId !== 'string') {
    throw new TypeError('Org ID is not a string.');
  }

  var initConfig = transformArrayToObject(extensionSettings.variables || []);
  var doesOptInApply = extensionSettings.doesOptInApply;
  if (doesOptInApply) {
    if (typeof doesOptInApply === 'boolean') {
      initConfig['doesOptInApply'] = doesOptInApply; 
    } else if (extensionSettings.optInCallback) {
      initConfig['doesOptInApply'] = extensionSettings.optInCallback; 
    }
  }

  var isOptInStorageEnabled = extensionSettings.isOptInStorageEnabled;
  if (isOptInStorageEnabled) {
    initConfig['isOptInStorageEnabled'] = isOptInStorageEnabled;
  }

  var optInCookieDomain = extensionSettings.optInCookieDomain;
  if (optInCookieDomain) {
    initConfig['optInCookieDomain'] = optInCookieDomain;
  }

  var optInStorageExpiry = extensionSettings.optInStorageExpiry;
  if (optInStorageExpiry) {
    var timeUnit = extensionSettings.timeUnit;
    if (timeUnit && timeUnits[timeUnit]) {
      var seconds = optInStorageExpiry * timeUnits[timeUnit];
      initConfig['optInStorageExpiry'] = seconds;
    }
  } else if (isOptInStorageEnabled === true) {
    // default is 13 months
    initConfig['optInStorageExpiry'] = 13 * 30 * 24 * 3600;
  }

  var previousPermissions = extensionSettings.previousPermissions;
  if (previousPermissions) {
    initConfig['previousPermissions'] = previousPermissions;
  }

  var preOptInApprovals = extensionSettings.preOptInApprovals;
  if (preOptInApprovals) {
    initConfig['preOptInApprovals'] = preOptInApprovals;
  } else {
    var preOptInApprovalInput = extensionSettings.preOptInApprovalInput;
    if (preOptInApprovalInput) {
      initConfig['preOptInApprovals'] = preOptInApprovalInput;
    }
  }

  var isIabContext = extensionSettings.isIabContext;
  if (isIabContext) {
    initConfig['isIabContext'] = isIabContext;
  }

  var instance = Visitor.getInstance(extensionSettings.orgId, initConfig);

  turbine.logger.info('Created instance using orgId: "' + extensionSettings.orgId + '"');
  turbine.logger.info('Set variables: ' + JSON.stringify(initConfig));

  // getMarketingCloudVisitorID is called automatically when the instance is created, but
  // we call it here so that we can log the ID once it has been retrieved from the server.
  // Calling getMarketingCloudVisitorID multiple times will not result in multiple requests
  // to the server.
  instance.getMarketingCloudVisitorID(function(id) {
    turbine.logger.info('Obtained Marketing Cloud Visitor Id: ' + id);
  }, true);

  return instance;
};

var excludePathsMatched = function(path) {
  var extensionSettings = turbine.getExtensionSettings();
  var pathExclusions = extensionSettings.pathExclusions || [];

  return pathExclusions.some(function(pathExclusion) {
    if (pathExclusion.valueIsRegex) {
      return new RegExp(pathExclusion.value, 'i').test(path);
    } else {
      return pathExclusion.value === path;
    }
  });
};

var visitorIdInstance = null;

// Overwrite the getVisitorId exposed in Turbine. This is largely for backward compatibility
// since DTM supported this method on _satellite.
_satellite.getVisitorId = function() { return visitorIdInstance; };

if (excludePathsMatched(document.location.pathname)) {
  turbine.logger.warn('MCID library not loaded. One of the path exclusions matches the ' +
    'current path.');
} else {
  visitorIdInstance = initializeVisitorId(VisitorAPI);
}

module.exports = visitorIdInstance;

          }
,
          "name": "mcid-instance",
          "shared": true
        },
        "adobe-mcid/src/lib/codeLibrary/VisitorAPI.js": {
          "script": function(module, exports, require, turbine) {
/* istanbul ignore next */
module.exports = function() {
/**
 * @license
 * Adobe Visitor API for JavaScript version: 5.4.0
 * Copyright 2022 Adobe, Inc. All Rights Reserved
 * More info available at https://marketing.adobe.com/resources/help/en_US/mcvid/
 */
 var e=function(){"use strict";function e(t){"@babel/helpers - typeof";return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function n(){return{callbacks:{},add:function(e,t){this.callbacks[e]=this.callbacks[e]||[];var n=this.callbacks[e].push(t)-1,i=this;return function(){i.callbacks[e].splice(n,1)}},execute:function(e,t){if(this.callbacks[e]){t=void 0===t?[]:t,t=t instanceof Array?t:[t];try{for(;this.callbacks[e].length;){var n=this.callbacks[e].shift();"function"==typeof n?n.apply(null,t):n instanceof Array&&n[1].apply(n[0],t)}delete this.callbacks[e]}catch(e){}}},executeAll:function(e,t){(t||e&&!U.isObjectEmpty(e))&&Object.keys(this.callbacks).forEach(function(t){var n=void 0!==e[t]?e[t]:"";this.execute(t,n)},this)},hasCallbacks:function(){return Boolean(Object.keys(this.callbacks).length)}}}function i(e,t,n){var i=null==e?void 0:e[t];return void 0===i?n:i}function r(e){for(var t=/^\d+$/,n=0,i=e.length;n<i;n++)if(!t.test(e[n]))return!1;return!0}function a(e,t){for(;e.length<t.length;)e.push("0");for(;t.length<e.length;)t.push("0")}function o(e,t){for(var n=0;n<e.length;n++){var i=parseInt(e[n],10),r=parseInt(t[n],10);if(i>r)return 1;if(r>i)return-1}return 0}function s(e,t){if(e===t)return 0;var n=e.toString().split("."),i=t.toString().split(".");return r(n.concat(i))?(a(n,i),o(n,i)):NaN}function c(e){return e===Object(e)&&0===Object.keys(e).length}function u(e){return"function"==typeof e||e instanceof Array&&e.length}function l(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){return!0};this.log=Ie("log",e,t),this.warn=Ie("warn",e,t),this.error=Ie("error",e,t)}function d(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.cookieName,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=n.cookies;if(!t||!i)return{get:xe,set:xe,remove:xe};var r={remove:function(){i.remove(t)},get:function(){var e=i.get(t),n={};try{n=JSON.parse(e)}catch(e){n={}}return n},set:function(e,n){n=n||{};var a=r.get(),o=Object.assign(a,e);i.set(t,JSON.stringify(o),{domain:n.optInCookieDomain||"",cookieLifetime:n.optInStorageExpiry||3419e4,expires:!0})}};return r}function f(e){this.name=this.constructor.name,this.message=e,"function"==typeof Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error(e).stack}function p(){function e(e,t){var n=Ae(e);return n.length?n.every(function(e){return!!t[e]}):Oe(t)}function t(){M(A),O(de.COMPLETE),_(h.status,h.permissions),s&&m.set(h.permissions,{optInCookieDomain:c,optInStorageExpiry:u}),C.execute(He)}function n(e){return function(n,i){if(!Me(n))throw new Error("[OptIn] Invalid category(-ies). Please use the `OptIn.Categories` enum.");return O(de.CHANGED),Object.assign(A,ke(Ae(n),e)),i||t(),h}}var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=i.doesOptInApply,a=i.previousPermissions,o=i.preOptInApprovals,s=i.isOptInStorageEnabled,c=i.optInCookieDomain,u=i.optInStorageExpiry,l=i.isIabContext,f=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},p=f.cookies,g=Ne(a);Fe(g,"Invalid `previousPermissions`!"),Fe(o,"Invalid `preOptInApprovals`!");var m=d({cookieName:"adobeujs-optin"},{cookies:p}),h=this,_=le(h),C=_e(),S=Le(g),I=Le(o),v=s?m.get():{},D={},y=function(e,t){return Pe(e)||t&&Pe(t)?de.COMPLETE:de.PENDING}(S,v),b=function(e,t,n){var i=ke(he,!r);return r?Object.assign({},i,e,t,n):i}(I,S,v),A=Ee(b),O=function(e){return y=e},M=function(e){return b=e};h.deny=n(!1),h.approve=n(!0),h.denyAll=h.deny.bind(h,he),h.approveAll=h.approve.bind(h,he),h.isApproved=function(t){return e(t,h.permissions)},h.isPreApproved=function(t){return e(t,I)},h.fetchPermissions=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=t?h.on(de.COMPLETE,e):xe;return!r||r&&h.isComplete||!!o?e(h.permissions):t||C.add(He,function(){return e(h.permissions)}),n},h.complete=function(){h.status===de.CHANGED&&t()},h.registerPlugin=function(e){if(!e||!e.name||"function"!=typeof e.onRegister)throw new Error(Be);D[e.name]||(D[e.name]=e,e.onRegister.call(e,h))},h.execute=Ue(D),h.memoizeContent=function(e){we(e)&&m.set(e,{optInCookieDomain:c,optInStorageExpiry:u})},h.getMemoizedContent=function(e){var t=m.get();if(t)return t[e]},Object.defineProperties(h,{permissions:{get:function(){return b}},status:{get:function(){return y}},Categories:{get:function(){return fe}},doesOptInApply:{get:function(){return!!r}},isPending:{get:function(){return h.status===de.PENDING}},isComplete:{get:function(){return h.status===de.COMPLETE}},__plugins:{get:function(){return Object.keys(D)}},isIabContext:{get:function(){return l}}})}function g(e,t){function n(){r=null,e.call(e,new f("The call took longer than you wanted!"))}function i(){r&&(clearTimeout(r),e.apply(e,arguments))}if(void 0===t)return e;var r=setTimeout(n,t);return i}function m(){if(window.__tcfapi)return window.__tcfapi;var e=window;if(e===window.top)return void ye.error("__tcfapi not found");for(var t;!t;){e=e.parent;try{e.frames.__tcfapiLocator&&(t=e)}catch(e){}if(e===window.top)break}if(!t)return void ye.error("__tcfapi not found");var n={};return window.__tcfapi=function(e,i,r,a){var o=Math.random()+"",s={__tcfapiCall:{command:e,parameter:a,version:i,callId:o}};n[o]=r,t.postMessage(s,"*")},window.addEventListener("message",function(e){var t=e.data;if("string"==typeof t)try{t=JSON.parse(e.data)}catch(e){}if(t.__tcfapiReturn){var i=t.__tcfapiReturn;"function"==typeof n[i.callId]&&(n[i.callId](i.returnValue,i.success),delete n[i.callId])}},!1),window.__tcfapi}function h(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],i=!0===e.vendor.consents[t],r=n.every(function(t){return!0===e.purpose.consents[t]});return i&&r}function _(){var e=this;e.name="iabPlugin",e.version="0.0.2";var t,n=_e(),i={transparencyAndConsentData:null},r=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return i[e]=t};e.fetchConsentData=function(e){var t=e.callback,n=e.timeout,i=g(t,n);a({callback:i})},e.isApproved=function(e){var t=e.callback,n=e.category,r=e.timeout;if(i.transparencyAndConsentData)return t(null,h(i.transparencyAndConsentData,pe[n],ge[n]));var o=g(function(e,i){t(e,h(i,pe[n],ge[n]))},r);a({category:n,callback:o})},e.onRegister=function(n){t=n;var i=Object.keys(pe),r=function(e,t){!e&&t&&(i.forEach(function(e){var i=h(t,pe[e],ge[e]);n[i?"approve":"deny"](e,!0)}),n.complete())};e.fetchConsentData({callback:r})};var a=function(e){var a=e.callback;if(i.transparencyAndConsentData)return a(null,i.transparencyAndConsentData);n.add("FETCH_CONSENT_DATA",a),o(function(e,a){if(a){var o=Ee(e),s=t.getMemoizedContent("iabConsentHash"),c=De(o.tcString).toString(32);o.consentString=e.tcString,o.hasConsentChangedSinceLastCmpPull=s!==c,r("transparencyAndConsentData",o),t.memoizeContent({iabConsentHash:c})}n.execute("FETCH_CONSENT_DATA",[null,i.transparencyAndConsentData])})},o=function(e){var t=Ve(pe),n=m();"function"==typeof n&&n("getTCData",2,e,t)}}var C="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};Object.assign=Object.assign||function(e){for(var t,n,i=1;i<arguments.length;++i){n=arguments[i];for(t in n)Object.prototype.hasOwnProperty.call(n,t)&&(e[t]=n[t])}return e};var S,I,v={HANDSHAKE:"HANDSHAKE",GETSTATE:"GETSTATE",PARENTSTATE:"PARENTSTATE"},D={MCMID:"MCMID",MCAID:"MCAID",MCAAMB:"MCAAMB",MCAAMLH:"MCAAMLH",MCOPTOUT:"MCOPTOUT",CUSTOMERIDS:"CUSTOMERIDS"},y={MCMID:"getMarketingCloudVisitorID",MCAID:"getAnalyticsVisitorID",MCAAMB:"getAudienceManagerBlob",MCAAMLH:"getAudienceManagerLocationHint",MCOPTOUT:"isOptedOut",ALLFIELDS:"getVisitorValues"},b={CUSTOMERIDS:"getCustomerIDs"},A={MCMID:"getMarketingCloudVisitorID",MCAAMB:"getAudienceManagerBlob",MCAAMLH:"getAudienceManagerLocationHint",MCOPTOUT:"isOptedOut",MCAID:"getAnalyticsVisitorID",CUSTOMERIDS:"getCustomerIDs",ALLFIELDS:"getVisitorValues"},O={MC:"MCMID",A:"MCAID",AAM:"MCAAMB"},M={MCMID:"MCMID",MCOPTOUT:"MCOPTOUT",MCAID:"MCAID",MCAAMLH:"MCAAMLH",MCAAMB:"MCAAMB"},k={UNKNOWN:0,AUTHENTICATED:1,LOGGED_OUT:2},E={GLOBAL:"global"},T={LAX:"Lax",STRICT:"Strict",NONE:"None"},L={MESSAGES:v,STATE_KEYS_MAP:D,ASYNC_API_MAP:y,SYNC_API_MAP:b,ALL_APIS:A,FIELDGROUP_TO_FIELD:O,FIELDS:M,AUTH_STATE:k,OPT_OUT:E,SAME_SITE_VALUES:T},P=L.STATE_KEYS_MAP,R=function(e){function t(){}function n(t,n){var i=this;return function(){var r=e(0,t),a={};return a[t]=r,i.setStateAndPublish(a),n(r),r}}this.getMarketingCloudVisitorID=function(e){e=e||t;var i=this.findField(P.MCMID,e),r=n.call(this,P.MCMID,e);return void 0!==i?i:r()},this.getVisitorValues=function(e){this.getMarketingCloudVisitorID(function(t){e({MCMID:t})})}},w=L.MESSAGES,x=L.ASYNC_API_MAP,N=L.SYNC_API_MAP,F=function(){function e(){}function t(e,t){var n=this;return function(){return n.callbackRegistry.add(e,t),n.messageParent(w.GETSTATE),""}}function n(n){this[x[n]]=function(i){i=i||e;var r=this.findField(n,i),a=t.call(this,n,i);return void 0!==r?r:a()}}function i(t){this[N[t]]=function(){return this.findField(t,e)||{}}}Object.keys(x).forEach(n,this),Object.keys(N).forEach(i,this)},j=L.ASYNC_API_MAP,V=function(){Object.keys(j).forEach(function(e){this[j[e]]=function(t){this.callbackRegistry.add(e,t)}},this)},U=function(e,t){return t={exports:{}},e(t,t.exports),t.exports}(function(t,n){n.isObjectEmpty=function(e){return e===Object(e)&&0===Object.keys(e).length},n.isValueEmpty=function(e){return""===e||n.isObjectEmpty(e)};var i=function(){var e=navigator.appName,t=navigator.userAgent;return"Microsoft Internet Explorer"===e||t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0&&t.indexOf("Windows NT 6")>=0};n.getIeVersion=function(){return document.documentMode?document.documentMode:i()?7:null},n.isFirefox=function(e){return!!/Firefox\/([0-9\.]+)(?:\s|$)/.test(e||window.navigator.userAgent)},n.encodeAndBuildRequest=function(e,t){return e.map(encodeURIComponent).join(t)},n.isObject=function(t){return null!==t&&"object"===e(t)&&!1===Array.isArray(t)},n.defineGlobalNamespace=function(){return window.adobe=n.isObject(window.adobe)?window.adobe:{},window.adobe},n.pluck=function(e,t){return t.reduce(function(t,n){return e[n]&&(t[n]=e[n]),t},Object.create(null))},n.parseOptOut=function(e,t,n){t||(t=n,e.d_optout&&e.d_optout instanceof Array&&(t=e.d_optout.join(",")));var i=parseInt(e.d_ottl,10);return isNaN(i)&&(i=7200),{optOut:t,d_ottl:i}},n.normalizeBoolean=function(e){var t=e;return"true"===e?t=!0:"false"===e&&(t=!1),t}}),H=(U.isObjectEmpty,U.isValueEmpty,U.getIeVersion,U.isFirefox,U.encodeAndBuildRequest,U.isObject,U.defineGlobalNamespace,U.pluck,U.parseOptOut,U.normalizeBoolean,n),B=L.MESSAGES,G={0:"prefix",1:"orgID",2:"state"},Y=function(e,t){this.parse=function(e){try{var t={};return e.data.split("|").forEach(function(e,n){if(void 0!==e){t[G[n]]=2!==n?e:JSON.parse(e)}}),t}catch(e){}},this.isInvalid=function(n){var i=this.parse(n);if(!i||Object.keys(i).length<2)return!0;var r=e!==i.orgID,a=!t||n.origin!==t,o=-1===Object.keys(B).indexOf(i.prefix);return r||a||o},this.send=function(n,i,r){var a=i+"|"+e;r&&r===Object(r)&&(a+="|"+JSON.stringify(r));try{n.postMessage(a,t)}catch(e){}}},q=L.MESSAGES,W=function(e,t,n,i){function r(e){Object.assign(p,e)}function a(e){Object.assign(p.state,e),Object.assign(p.state.ALLFIELDS,e),p.callbackRegistry.executeAll(p.state)}function o(e){if(!h.isInvalid(e)){m=!1;var t=h.parse(e);p.setStateAndPublish(t.state)}}function s(e){!m&&g&&(m=!0,h.send(i,e))}function c(){r(new R(n._generateID)),p.getMarketingCloudVisitorID(),p.callbackRegistry.executeAll(p.state,!0),C.removeEventListener("message",u)}function u(e){if(!h.isInvalid(e)){var t=h.parse(e);m=!1,C.clearTimeout(p._handshakeTimeout),C.removeEventListener("message",u),r(new F(p)),C.addEventListener("message",o),p.setStateAndPublish(t.state),p.callbackRegistry.hasCallbacks()&&s(q.GETSTATE)}}function l(){g&&postMessage?(C.addEventListener("message",u),s(q.HANDSHAKE),p._handshakeTimeout=setTimeout(c,250)):c()}function d(){C.s_c_in||(C.s_c_il=[],C.s_c_in=0),p._c="Visitor",p._il=C.s_c_il,p._in=C.s_c_in,p._il[p._in]=p,C.s_c_in++}function f(){function e(e){0!==e.indexOf("_")&&"function"==typeof n[e]&&(p[e]=function(){})}Object.keys(n).forEach(e),p.getSupplementalDataID=n.getSupplementalDataID,p.isAllowed=function(){return!0}}var p=this,g=t.whitelistParentDomain;p.state={ALLFIELDS:{}},p.version=n.version,p.marketingCloudOrgID=e,p.cookieDomain=n.cookieDomain||"",p._instanceType="child";var m=!1,h=new Y(e,g);p.callbackRegistry=H(),p.init=function(){d(),f(),r(new V(p)),l()},p.findField=function(e,t){if(void 0!==p.state[e])return t(p.state[e]),p.state[e]},p.messageParent=s,p.setStateAndPublish=a},X=L.MESSAGES,K=L.ALL_APIS,J=L.ASYNC_API_MAP,z=L.FIELDGROUP_TO_FIELD,Q=function(e,t){function n(){var t={};return Object.keys(K).forEach(function(n){var i=K[n],r=e[i]();U.isValueEmpty(r)||(t[n]=r)}),t}function i(){var t=[];return e._loading&&Object.keys(e._loading).forEach(function(n){if(e._loading[n]){var i=z[n];t.push(i)}}),t.length?t:null}function r(t){return function n(r){var a=i();if(a){var o=J[a[0]];e[o](n,!0)}else t()}}function a(e,i){var r=n();t.send(e,i,r)}function o(e){c(e),a(e,X.HANDSHAKE)}function s(e){r(function(){a(e,X.PARENTSTATE)})()}function c(n){function i(i){r.call(e,i),t.send(n,X.PARENTSTATE,{CUSTOMERIDS:e.getCustomerIDs()})}var r=e.setCustomerIDs;e.setCustomerIDs=i}return function(e){if(!t.isInvalid(e)){(t.parse(e).prefix===X.HANDSHAKE?o:s)(e.source)}}},$=function(e,t){function n(e){return function(n){i[e]=n,r++,r===a&&t(i)}}var i={},r=0,a=Object.keys(e).length;Object.keys(e).forEach(function(t){var i=e[t];if(i.fn){var r=i.args||[];r.unshift(n(t)),i.fn.apply(i.context||null,r)}})},Z={get:function(e){e=encodeURIComponent(e);var t=(";"+document.cookie).split(" ").join(";"),n=t.indexOf(";"+e+"="),i=n<0?n:t.indexOf(";",n+1);return n<0?"":decodeURIComponent(t.substring(n+2+e.length,i<0?t.length:i))},set:function(e,t,n){var r=i(n,"cookieLifetime"),a=i(n,"expires"),o=i(n,"domain"),s=i(n,"secure"),c=i(n,"sameSite"),u=s?"Secure":"",l=c?"SameSite="+c+";":"";if(a&&"SESSION"!==r&&"NONE"!==r){var d=""!==t?parseInt(r||0,10):-60;if(d)a=new Date,a.setTime(a.getTime()+1e3*d);else if(1===a){a=new Date;var f=a.getYear();a.setYear(f+2+(f<1900?1900:0))}}else a=0;return e&&"NONE"!==r?(document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(t)+"; path=/;"+(a?" expires="+a.toGMTString()+";":"")+(o?" domain="+o+";":"")+l+u,this.get(e)===t):0},remove:function(e,t){var n=i(t,"domain");n=n?" domain="+n+";":"";var r=i(t,"secure"),a=i(t,"sameSite"),o=r?"Secure":"",s=a?"SameSite="+a+";":"";document.cookie=encodeURIComponent(e)+"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"+n+s+o}},ee=function(e,t){var n;!e&&C.location&&(e=C.location.hostname),n=e;var i,r=n.split("."),a=t||{};for(i=r.length-2;i>=0;i--)if(a.domain=r.slice(i).join("."),Z.set("TEST_AMCV_COOKIE_WRITE","cookie",a))return Z.remove("TEST_AMCV_COOKIE_WRITE",a),a.domain;return""},te={compare:s,isLessThan:function(e,t){return s(e,t)<0},areVersionsDifferent:function(e,t){return 0!==s(e,t)},isGreaterThan:function(e,t){return s(e,t)>0},isEqual:function(e,t){return 0===s(e,t)}},ne=!!C.postMessage,ie={postMessage:function(e,t,n){var i=1;t&&(ne?n.postMessage(e,t.replace(/([^:]+:\/\/[^\/]+).*/,"$1")):t&&(n.location=t.replace(/#.*$/,"")+"#"+ +new Date+i+++"&"+e))},receiveMessage:function(e,t){var n;try{ne&&(e&&(n=function(n){if("string"==typeof t&&n.origin!==t||"[object Function]"===Object.prototype.toString.call(t)&&!1===t(n.origin))return!1;e(n)}),C.addEventListener?C[e?"addEventListener":"removeEventListener"]("message",n):C[e?"attachEvent":"detachEvent"]("onmessage",n))}catch(e){}}},re=function(e){var t,n,i="0123456789",r="",a="",o=8,s=10,c=10,u=""+Date.now(),l=u.substr(-6).split("").reverse("").join("");if(1==e){for(i+="ABCDEF",t=0;16>t;t++)n=Math.floor(Math.random()*o),4>t&&l[t]<o&&(n=+l[t]),r+=i.substring(n,n+1),n=Math.floor(Math.random()*o),a+=i.substring(n,n+1),o=16;return r+"-"+a}for(t=0;19>t;t++)n=Math.floor(Math.random()*s),6>t&&l[t]<s?(r+=l[t],n=l[t]):r+=i.substring(n,n+1),0===t&&9==n?s=3:(1==t||2==t)&&10!=s&&2>n?s=10:2<t&&(s=10),n=Math.floor(Math.random()*c),a+=i.substring(n,n+1),0===t&&9==n?c=3:(1==t||2==t)&&10!=c&&2>n?c=10:2<t&&(c=10);return r+a},ae=function(e,t){return{corsMetadata:function(){var e="none",t=!0;return"undefined"!=typeof XMLHttpRequest&&XMLHttpRequest===Object(XMLHttpRequest)&&("withCredentials"in new XMLHttpRequest?e="XMLHttpRequest":"undefined"!=typeof XDomainRequest&&XDomainRequest===Object(XDomainRequest)&&(t=!1),Object.prototype.toString.call(C.HTMLElement).indexOf("Constructor")>0&&(t=!1)),{corsType:e,corsCookiesEnabled:t}}(),getCORSInstance:function(){return"none"===this.corsMetadata.corsType?null:new C[this.corsMetadata.corsType]},fireCORS:function(t,n,i){function r(e){var n;try{if((n=JSON.parse(e))!==Object(n))return void a.handleCORSError(t,null,"Response is not JSON")}catch(e){return void a.handleCORSError(t,e,"Error parsing response as JSON")}try{for(var i=t.callback,r=C,o=0;o<i.length;o++)r=r[i[o]];r(n)}catch(e){a.handleCORSError(t,e,"Error forming callback function")}}var a=this;n&&(t.loadErrorHandler=n);try{var o=this.getCORSInstance();o.open("get",t.corsUrl+"&ts="+(new Date).getTime(),!0),"XMLHttpRequest"===this.corsMetadata.corsType&&(o.withCredentials=!0,o.timeout=e.loadTimeout,o.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),o.onreadystatechange=function(){4===this.readyState&&200===this.status&&r(this.responseText)}),o.onerror=function(e){a.handleCORSError(t,e,"onerror")},o.ontimeout=function(e){a.handleCORSError(t,e,"ontimeout")},o.send(),e._log.requests.push(t.corsUrl)}catch(e){this.handleCORSError(t,e,"try-catch")}},handleCORSError:function(t,n,i){e.CORSErrors.push({corsData:t,error:n,description:i}),t.loadErrorHandler&&("ontimeout"===i?t.loadErrorHandler(!0):t.loadErrorHandler(!1))}}},oe={POST_MESSAGE_ENABLED:!!C.postMessage,DAYS_BETWEEN_SYNC_ID_CALLS:1,MILLIS_PER_DAY:864e5,ADOBE_MC:"adobe_mc",ADOBE_MC_SDID:"adobe_mc_sdid",VALID_VISITOR_ID_REGEX:/^[0-9a-fA-F\-]+$/,ADOBE_MC_TTL_IN_MIN:5,VERSION_REGEX:/vVersion\|((\d+\.)?(\d+\.)?(\*|\d+))(?=$|\|)/,FIRST_PARTY_SERVER_COOKIE:"s_ecid"},se=function(e,t){var n=C.document;return{THROTTLE_START:3e4,MAX_SYNCS_LENGTH:649,throttleTimerSet:!1,id:null,onPagePixels:[],iframeHost:null,getIframeHost:function(e){if("string"==typeof e){var t=e.split("/");return t[0]+"//"+t[2]}},subdomain:null,url:null,getUrl:function(){var t,i="http://fast.",r="?d_nsid="+e.idSyncContainerID+"#"+encodeURIComponent(n.location.origin);return this.subdomain||(this.subdomain="nosubdomainreturned"),e.loadSSL&&(i=e.idSyncSSLUseAkamai?"https://fast.":"https://"),t=i+this.subdomain+".demdex.net/dest5.html"+r,this.iframeHost=this.getIframeHost(t),this.id="destination_publishing_iframe_"+this.subdomain+"_"+e.idSyncContainerID,t},checkDPIframeSrc:function(){var t="?d_nsid="+e.idSyncContainerID+"#"+encodeURIComponent(n.location.href);"string"==typeof e.dpIframeSrc&&e.dpIframeSrc.length&&(this.id="destination_publishing_iframe_"+(e._subdomain||this.subdomain||(new Date).getTime())+"_"+e.idSyncContainerID,this.iframeHost=this.getIframeHost(e.dpIframeSrc),this.url=e.dpIframeSrc+t)},idCallNotProcesssed:null,doAttachIframe:!1,startedAttachingIframe:!1,iframeHasLoaded:null,iframeIdChanged:null,newIframeCreated:null,originalIframeHasLoadedAlready:null,iframeLoadedCallbacks:[],regionChanged:!1,timesRegionChanged:0,sendingMessages:!1,messages:[],messagesPosted:[],messagesReceived:[],messageSendingInterval:oe.POST_MESSAGE_ENABLED?null:100,onPageDestinationsFired:[],jsonForComparison:[],jsonDuplicates:[],jsonWaiting:[],jsonProcessed:[],canSetThirdPartyCookies:!0,receivedThirdPartyCookiesNotification:!1,readyToAttachIframePreliminary:function(){return!(e.idSyncDisableSyncs||e.disableIdSyncs||e.idSyncDisable3rdPartySyncing||e.disableThirdPartyCookies||e.disableThirdPartyCalls)},readyToAttachIframe:function(){return this.readyToAttachIframePreliminary()&&(this.doAttachIframe||e._doAttachIframe)&&(this.subdomain&&"nosubdomainreturned"!==this.subdomain||e._subdomain)&&this.url&&!this.startedAttachingIframe},attachIframe:function(){function e(){r=n.createElement("iframe"),r.sandbox="allow-scripts allow-same-origin",r.title="Adobe ID Syncing iFrame",r.id=i.id,r.name=i.id+"_name",r.style.cssText="display: none; width: 0; height: 0;",r.src=i.url,i.newIframeCreated=!0,t(),n.body.appendChild(r)}function t(e){r.addEventListener("load",function(){r.className="aamIframeLoaded",i.iframeHasLoaded=!0,i.fireIframeLoadedCallbacks(e),i.requestToProcess()})}this.startedAttachingIframe=!0;var i=this,r=n.getElementById(this.id);r?"IFRAME"!==r.nodeName?(this.id+="_2",this.iframeIdChanged=!0,e()):(this.newIframeCreated=!1,"aamIframeLoaded"!==r.className?(this.originalIframeHasLoadedAlready=!1,t("The destination publishing iframe already exists from a different library, but hadn't loaded yet.")):(this.originalIframeHasLoadedAlready=!0,this.iframeHasLoaded=!0,this.iframe=r,this.fireIframeLoadedCallbacks("The destination publishing iframe already exists from a different library, and had loaded alresady."),this.requestToProcess())):e(),this.iframe=r},fireIframeLoadedCallbacks:function(e){this.iframeLoadedCallbacks.forEach(function(t){"function"==typeof t&&t({message:e||"The destination publishing iframe was attached and loaded successfully."})}),this.iframeLoadedCallbacks=[]},requestToProcess:function(t){function n(){r.jsonForComparison.push(t),r.jsonWaiting.push(t),r.processSyncOnPage(t)}var i,r=this;if(t===Object(t)&&t.ibs)if(i=JSON.stringify(t.ibs||[]),this.jsonForComparison.length){var a,o,s,c=!1;for(a=0,o=this.jsonForComparison.length;a<o;a++)if(s=this.jsonForComparison[a],i===JSON.stringify(s.ibs||[])){c=!0;break}c?this.jsonDuplicates.push(t):n()}else n();if((this.receivedThirdPartyCookiesNotification||!oe.POST_MESSAGE_ENABLED||this.iframeHasLoaded)&&this.jsonWaiting.length){var u=this.jsonWaiting.shift();this.process(u),this.requestToProcess()}e.idSyncDisableSyncs||e.disableIdSyncs||!this.iframeHasLoaded||!this.messages.length||this.sendingMessages||(this.throttleTimerSet||(this.throttleTimerSet=!0,setTimeout(function(){r.messageSendingInterval=oe.POST_MESSAGE_ENABLED?null:150},this.THROTTLE_START)),this.sendingMessages=!0,this.sendMessages())},getRegionAndCheckIfChanged:function(t,n){var i=e._getField("MCAAMLH"),r=t.d_region||t.dcs_region;return i?r&&(e._setFieldExpire("MCAAMLH",n),e._setField("MCAAMLH",r),parseInt(i,10)!==r&&(this.regionChanged=!0,this.timesRegionChanged++,e._setField("MCSYNCSOP",""),e._setField("MCSYNCS",""),i=r)):(i=r)&&(e._setFieldExpire("MCAAMLH",n),e._setField("MCAAMLH",i)),i||(i=""),i},processSyncOnPage:function(e){var t,n,i,r;if((t=e.ibs)&&t instanceof Array&&(n=t.length))for(i=0;i<n;i++)r=t[i],r.syncOnPage&&this.checkFirstPartyCookie(r,"","syncOnPage")},process:function(e){var t,n,i,r,a,o=encodeURIComponent,s=!1;if((t=e.ibs)&&t instanceof Array&&(n=t.length))for(s=!0,i=0;i<n;i++)r=t[i],a=[o("ibs"),o(r.id||""),o(r.tag||""),U.encodeAndBuildRequest(r.url||[],","),o(r.ttl||""),"","",r.fireURLSync?"true":"false"],r.syncOnPage||(this.canSetThirdPartyCookies?this.addMessage(a.join("|")):r.fireURLSync&&this.checkFirstPartyCookie(r,a.join("|")));s&&this.jsonProcessed.push(e)},checkFirstPartyCookie:function(t,n,i){var r="syncOnPage"===i,a=r?"MCSYNCSOP":"MCSYNCS";e._readVisitor();var o,s,c=e._getField(a),u=!1,l=!1,d=Math.ceil((new Date).getTime()/oe.MILLIS_PER_DAY);c?(o=c.split("*"),s=this.pruneSyncData(o,t.id,d),u=s.dataPresent,l=s.dataValid,u&&l||this.fireSync(r,t,n,o,a,d)):(o=[],this.fireSync(r,t,n,o,a,d))},pruneSyncData:function(e,t,n){var i,r,a,o=!1,s=!1;for(r=0;r<e.length;r++)i=e[r],a=parseInt(i.split("-")[1],10),i.match("^"+t+"-")?(o=!0,n<a?s=!0:(e.splice(r,1),r--)):n>=a&&(e.splice(r,1),r--);return{dataPresent:o,dataValid:s}},manageSyncsSize:function(e){if(e.join("*").length>this.MAX_SYNCS_LENGTH)for(e.sort(function(e,t){return parseInt(e.split("-")[1],10)-parseInt(t.split("-")[1],10)});e.join("*").length>this.MAX_SYNCS_LENGTH;)e.shift()},fireSync:function(t,n,i,r,a,o){var s=this;if(t){if("img"===n.tag){var c,u,l,d,f=n.url,p=e.loadSSL?"https:":"http:";for(c=0,u=f.length;c<u;c++){l=f[c],d=/^\/\//.test(l);var g=new Image;g.addEventListener("load",function(t,n,i,r){return function(){s.onPagePixels[t]=null,e._readVisitor();var o,c=e._getField(a),u=[];if(c){o=c.split("*");var l,d,f;for(l=0,d=o.length;l<d;l++)f=o[l],f.match("^"+n.id+"-")||u.push(f)}s.setSyncTrackingData(u,n,i,r)}}(this.onPagePixels.length,n,a,o)),g.src=(d?p:"")+l,this.onPagePixels.push(g)}}}else this.addMessage(i),this.setSyncTrackingData(r,n,a,o)},addMessage:function(t){var n=encodeURIComponent,i=n(e._enableErrorReporting?"---destpub-debug---":"---destpub---");this.messages.push((oe.POST_MESSAGE_ENABLED?"":i)+t)},setSyncTrackingData:function(t,n,i,r){t.push(n.id+"-"+(r+Math.ceil(n.ttl/60/24))),this.manageSyncsSize(t),e._setField(i,t.join("*"))},sendMessages:function(){var e,t=this,n="",i=encodeURIComponent;this.regionChanged&&(n=i("---destpub-clear-dextp---"),this.regionChanged=!1),this.messages.length?oe.POST_MESSAGE_ENABLED?(e=n+i("---destpub-combined---")+this.messages.join("%01"),this.postMessage(e),this.messages=[],this.sendingMessages=!1):(e=this.messages.shift(),this.postMessage(n+e),setTimeout(function(){t.sendMessages()},this.messageSendingInterval)):this.sendingMessages=!1},postMessage:function(e){ie.postMessage(e,this.url,this.iframe.contentWindow),this.messagesPosted.push(e)},receiveMessage:function(e){var t,n=/^---destpub-to-parent---/;"string"==typeof e&&n.test(e)&&(t=e.replace(n,"").split("|"),"canSetThirdPartyCookies"===t[0]&&(this.canSetThirdPartyCookies="true"===t[1],this.receivedThirdPartyCookiesNotification=!0,this.requestToProcess()),this.messagesReceived.push(e))},processIDCallData:function(i){(null==this.url||i.subdomain&&"nosubdomainreturned"===this.subdomain)&&("string"==typeof e._subdomain&&e._subdomain.length?this.subdomain=e._subdomain:this.subdomain=i.subdomain||"",this.url=this.getUrl()),i.ibs instanceof Array&&i.ibs.length&&(this.doAttachIframe=!0),this.readyToAttachIframe()&&(e.idSyncAttachIframeOnWindowLoad?(t.windowLoaded||"complete"===n.readyState||"loaded"===n.readyState)&&this.attachIframe():this.attachIframeASAP()),"function"==typeof e.idSyncIDCallResult?e.idSyncIDCallResult(i):this.requestToProcess(i),"function"==typeof e.idSyncAfterIDCallResult&&e.idSyncAfterIDCallResult(i)},canMakeSyncIDCall:function(t,n){return e._forceSyncIDCall||!t||n-t>oe.DAYS_BETWEEN_SYNC_ID_CALLS},attachIframeASAP:function(){function e(){t.startedAttachingIframe||(n.body?t.attachIframe():setTimeout(e,30))}var t=this;e()}}},ce={audienceManagerServer:{},audienceManagerServerSecure:{},cookieDomain:{},cookieLifetime:{},cookieName:{},doesOptInApply:{type:"boolean"},disableThirdPartyCalls:{type:"boolean"},discardTrackingServerECID:{type:"boolean"},idSyncAfterIDCallResult:{},idSyncAttachIframeOnWindowLoad:{type:"boolean"},idSyncContainerID:{},idSyncDisable3rdPartySyncing:{type:"boolean"},disableThirdPartyCookies:{type:"boolean"},idSyncDisableSyncs:{type:"boolean"},disableIdSyncs:{type:"boolean"},idSyncIDCallResult:{},idSyncSSLUseAkamai:{type:"boolean"},isCoopSafe:{type:"boolean"},isIabContext:{type:"boolean"},isOptInStorageEnabled:{type:"boolean"},loadSSL:{type:"boolean"},loadTimeout:{},marketingCloudServer:{},marketingCloudServerSecure:{},optInCookieDomain:{},optInStorageExpiry:{},overwriteCrossDomainMCIDAndAID:{type:"boolean"},preOptInApprovals:{},previousPermissions:{},resetBeforeVersion:{},sdidParamExpiry:{},serverState:{},sessionCookieName:{},secureCookie:{type:"boolean"},sameSiteCookie:{},takeTimeoutMetrics:{},trackingServer:{},trackingServerSecure:{},useLocalStorage:{type:"boolean"},whitelistIframeDomains:{},whitelistParentDomain:{}},ue={getConfigNames:function(){return Object.keys(ce)},getConfigs:function(){return ce},normalizeConfig:function(e,t){return ce[e]&&"boolean"===ce[e].type?"function"!=typeof t?t:t():t}},le=function(e){var t={};return e.on=function(e,n,i){if(!n||"function"!=typeof n)throw new Error("[ON] Callback should be a function.");t.hasOwnProperty(e)||(t[e]=[]);var r=t[e].push({callback:n,context:i})-1;return function(){t[e].splice(r,1),t[e].length||delete t[e]}},e.off=function(e,n){t.hasOwnProperty(e)&&(t[e]=t[e].filter(function(e){if(e.callback!==n)return e}))},e.publish=function(e){if(t.hasOwnProperty(e)){var n=[].slice.call(arguments,1);t[e].slice(0).forEach(function(e){e.callback.apply(e.context,n)})}},e.publish},de={PENDING:"pending",CHANGED:"changed",COMPLETE:"complete"},fe={AAM:"aam",ADCLOUD:"adcloud",ANALYTICS:"aa",CAMPAIGN:"campaign",ECID:"ecid",LIVEFYRE:"livefyre",TARGET:"target",MEDIA_ANALYTICS:"mediaaa"},pe=(S={},t(S,fe.AAM,565),t(S,fe.ECID,565),S),ge=(I={},t(I,fe.AAM,[1,10]),t(I,fe.ECID,[1,10]),I),me=["videoaa","iabConsentHash"],he=function(e){return Object.keys(e).map(function(t){return e[t]})}(fe),_e=function(){var e={};return e.callbacks=Object.create(null),e.add=function(t,n){if(!u(n))throw new Error("[callbackRegistryFactory] Make sure callback is a function or an array of functions.");e.callbacks[t]=e.callbacks[t]||[];var i=e.callbacks[t].push(n)-1;return function(){e.callbacks[t].splice(i,1)}},e.execute=function(t,n){if(e.callbacks[t]){n=void 0===n?[]:n,n=n instanceof Array?n:[n];try{for(;e.callbacks[t].length;){var i=e.callbacks[t].shift();"function"==typeof i?i.apply(null,n):i instanceof Array&&i[1].apply(i[0],n)}delete e.callbacks[t]}catch(e){}}},e.executeAll=function(t,n){(n||t&&!c(t))&&Object.keys(e.callbacks).forEach(function(n){var i=void 0!==t[n]?t[n]:"";e.execute(n,i)},e)},e.hasCallbacks=function(){return Boolean(Object.keys(e.callbacks).length)},e},Ce=function(){},Se=function(e){var t=window,n=t.console;return!!n&&"function"==typeof n[e]},Ie=function(e,t,n){return n()?function(){if(Se(e)){for(var n=arguments.length,i=new Array(n),r=0;r<n;r++)i[r]=arguments[r];console[e].apply(console,[t].concat(i))}}:Ce},ve=l,De=function(){for(var e=[],t=0;t<256;t++){for(var n=t,i=0;i<8;i++)n=1&n?3988292384^n>>>1:n>>>1;e.push(n)}return function(t,n){t=unescape(encodeURIComponent(t)),n||(n=0),n^=-1;for(var i=0;i<t.length;i++){var r=255&(n^t.charCodeAt(i));n=n>>>8^e[r]}return(n^=-1)>>>0}}(),ye=new ve("[ADOBE OPT-IN]"),be=function(t,n){return e(t)===n},Ae=function(e,t){return e instanceof Array?e:be(e,"string")?[e]:t||[]},Oe=function(e){var t=Object.keys(e);return!!t.length&&t.every(function(t){return!0===e[t]})},Me=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return!(!e||Te(e))&&Ae(e).every(function(e){return he.indexOf(e)>-1||t&&me.indexOf(e)>-1})},ke=function(e,t){return e.reduce(function(e,n){return e[n]=t,e},{})},Ee=function(e){return JSON.parse(JSON.stringify(e))},Te=function(e){return"[object Array]"===Object.prototype.toString.call(e)&&!e.length},Le=function(e){if(we(e))return e;try{return JSON.parse(e)}catch(e){return{}}},Pe=function(e){return void 0===e||(we(e)?Me(Object.keys(e),!0):Re(e))},Re=function(e){try{var t=JSON.parse(e);return!!e&&be(e,"string")&&Me(Object.keys(t),!0)}catch(e){return!1}},we=function(e){return null!==e&&be(e,"object")&&!1===Array.isArray(e)},xe=function(){},Ne=function(e){return be(e,"function")?e():e},Fe=function(e,t){Pe(e)||ye.error("".concat(t))},je=function(e){return Object.keys(e).map(function(t){return e[t]})},Ve=function(e){return je(e).filter(function(e,t,n){return n.indexOf(e)===t})},Ue=function(e){return function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=t.command,i=t.params,r=void 0===i?{}:i,a=t.callback,o=void 0===a?xe:a;if(!n||-1===n.indexOf("."))throw new Error("[OptIn.execute] Please provide a valid command.");try{
	var s=n.split("."),c=e[s[0]],u=s[1];if(!c||"function"!=typeof c[u])throw new Error("Make sure the plugin and API name exist.");var l=Object.assign(r,{callback:o});c[u].call(c,l)}catch(e){ye.error("[execute] Something went wrong: "+e.message)}}};f.prototype=Object.create(Error.prototype),f.prototype.constructor=f;var He="fetchPermissions",Be="[OptIn#registerPlugin] Plugin is invalid.";p.Categories=fe,p.TimeoutError=f;var Ge=Object.freeze({OptIn:p,IabPlugin:_}),Ye=function(e,t){e.publishDestinations=function(n){var i=arguments[1],r=arguments[2];try{r="function"==typeof r?r:n.callback}catch(e){r=function(){}}var a=t;if(!a.readyToAttachIframePreliminary())return void r({error:"The destination publishing iframe is disabled in the Visitor library."});if("string"==typeof n){if(!n.length)return void r({error:"subdomain is not a populated string."});if(!(i instanceof Array&&i.length))return void r({error:"messages is not a populated array."});var o=!1;if(i.forEach(function(e){"string"==typeof e&&e.length&&(a.addMessage(e),o=!0)}),!o)return void r({error:"None of the messages are populated strings."})}else{if(!U.isObject(n))return void r({error:"Invalid parameters passed."});var s=n;if("string"!=typeof(n=s.subdomain)||!n.length)return void r({error:"config.subdomain is not a populated string."});var c=s.urlDestinations;if(!(c instanceof Array&&c.length))return void r({error:"config.urlDestinations is not a populated array."});var u=[];c.forEach(function(e){U.isObject(e)&&(e.hideReferrer?e.message&&a.addMessage(e.message):u.push(e))});!function e(){u.length&&setTimeout(function(){var t=new Image,n=u.shift();t.src=n.url,a.onPageDestinationsFired.push(n),e()},100)}()}a.iframe?(r({message:"The destination publishing iframe is already attached and loaded."}),a.requestToProcess()):!e.subdomain&&e._getField("MCMID")?(a.subdomain=n,a.doAttachIframe=!0,a.url=a.getUrl(),a.readyToAttachIframe()?(a.iframeLoadedCallbacks.push(function(e){r({message:"Attempted to attach and load the destination publishing iframe through this API call. Result: "+(e.message||"no result")})}),a.attachIframe()):r({error:"Encountered a problem in attempting to attach and load the destination publishing iframe through this API call."})):a.iframeLoadedCallbacks.push(function(e){r({message:"Attempted to attach and load the destination publishing iframe through normal Visitor API processing. Result: "+(e.message||"no result")})})}},qe=function e(t){function n(e,t){return e>>>t|e<<32-t}for(var i,r,a=Math.pow,o=a(2,32),s="",c=[],u=8*t.length,l=e.h=e.h||[],d=e.k=e.k||[],f=d.length,p={},g=2;f<64;g++)if(!p[g]){for(i=0;i<313;i+=g)p[i]=g;l[f]=a(g,.5)*o|0,d[f++]=a(g,1/3)*o|0}for(t+="";t.length%64-56;)t+="\0";for(i=0;i<t.length;i++){if((r=t.charCodeAt(i))>>8)return;c[i>>2]|=r<<(3-i)%4*8}for(c[c.length]=u/o|0,c[c.length]=u,r=0;r<c.length;){var m=c.slice(r,r+=16),h=l;for(l=l.slice(0,8),i=0;i<64;i++){var _=m[i-15],C=m[i-2],S=l[0],I=l[4],v=l[7]+(n(I,6)^n(I,11)^n(I,25))+(I&l[5]^~I&l[6])+d[i]+(m[i]=i<16?m[i]:m[i-16]+(n(_,7)^n(_,18)^_>>>3)+m[i-7]+(n(C,17)^n(C,19)^C>>>10)|0);l=[v+((n(S,2)^n(S,13)^n(S,22))+(S&l[1]^S&l[2]^l[1]&l[2]))|0].concat(l),l[4]=l[4]+v|0}for(i=0;i<8;i++)l[i]=l[i]+h[i]|0}for(i=0;i<8;i++)for(r=3;r+1;r--){var D=l[i]>>8*r&255;s+=(D<16?0:"")+D.toString(16)}return s},We=function(e,t){return"SHA-256"!==t&&"SHA256"!==t&&"sha256"!==t&&"sha-256"!==t||(e=qe(e)),e},Xe=function(e){return String(e).trim().toLowerCase()},Ke=Ge.OptIn;U.defineGlobalNamespace(),window.adobe.OptInCategories=Ke.Categories;var Je=function(t,n,i){function r(){S._customerIDsHashChanged=!1}function a(e){var t=e;return function(e){var n=e||A.location.href;try{var i=S._extractParamFromUri(n,t);if(i)return q.parsePipeDelimetedKeyValues(i)}catch(e){}}}function o(e){function t(e,t,n){e&&e.match(oe.VALID_VISITOR_ID_REGEX)&&(n===T&&(b=!0),t(e))}t(e[T],S.setMarketingCloudVisitorID,T),S._setFieldExpire(N,-1),t(e[w],S.setAnalyticsVisitorID)}function s(e){e=e||{},S._supplementalDataIDCurrent=e.supplementalDataIDCurrent||"",S._supplementalDataIDCurrentConsumed=e.supplementalDataIDCurrentConsumed||{},S._supplementalDataIDLast=e.supplementalDataIDLast||"",S._supplementalDataIDLastConsumed=e.supplementalDataIDLastConsumed||{}}function c(e){function t(e,t,n){return n=n?n+="|":n,n+=e+"="+encodeURIComponent(t)}function n(e,n){var i=n[0],r=n[1];return null!=r&&r!==F&&(e=t(i,r,e)),e}var i=e.reduce(n,"");return function(e){var t=q.getTimestampInSeconds();return e=e?e+="|":e,e+="TS="+t}(i)}function u(e){var t=e.minutesToLive,n="";return(S.idSyncDisableSyncs||S.disableIdSyncs)&&(n=n||"Error: id syncs have been disabled"),"string"==typeof e.dpid&&e.dpid.length||(n=n||"Error: config.dpid is empty"),"string"==typeof e.url&&e.url.length||(n=n||"Error: config.url is empty"),void 0===t?t=20160:(t=parseInt(t,10),(isNaN(t)||t<=0)&&(n=n||"Error: config.minutesToLive needs to be a positive number")),{error:n,ttl:t}}function l(){return!!S.configs.doesOptInApply&&!(I.optIn.isComplete&&d())}function d(){return S.configs.doesOptInApply&&S.configs.isIabContext?I.optIn.isApproved(I.optIn.Categories.ECID)&&y:I.optIn.isApproved(I.optIn.Categories.ECID)}function f(){[["getMarketingCloudVisitorID"],["setCustomerIDs",void 0],["syncIdentity",void 0],["getAnalyticsVisitorID"],["getAudienceManagerLocationHint"],["getLocationHint"],["getAudienceManagerBlob"]].forEach(function(e){var t=e[0],n=2===e.length?e[1]:"",i=S[t];S[t]=function(e){return d()&&S.isAllowed()?i.apply(S,arguments):("function"==typeof e&&S._callCallback(e,[n]),n)}})}function p(){var e=S._getAudienceManagerURLData(),t=e.url;return S._loadData(E,t,null,e)}function g(e,t){if(y=!0,e)throw new Error("[IAB plugin] : "+e);t&&t.gdprApplies&&(v=t.consentString,D=t.hasConsentChangedSinceLastCmpPull?1:0),p(),_()}function m(e,t){if(y=!0,e)throw new Error("[IAB plugin] : "+e);t.gdprApplies&&(v=t.consentString,D=t.hasConsentChangedSinceLastCmpPull?1:0),S.init(),_()}function h(){I.optIn.isComplete&&(I.optIn.isApproved(I.optIn.Categories.ECID)?S.configs.isIabContext?I.optIn.execute({command:"iabPlugin.fetchConsentData",callback:m}):(S.init(),_()):S.configs.isIabContext?I.optIn.execute({command:"iabPlugin.fetchConsentData",callback:g}):(f(),_()))}function _(){I.optIn.off("complete",h)}if(!i||i.split("").reverse().join("")!==t)throw new Error("Please use `Visitor.getInstance` to instantiate Visitor.");var S=this,I=window.adobe,v="",D=0,y=!1,b=!1;S.version="5.4.0";var A=C,O=A.Visitor;O.version=S.version,O.AuthState=L.AUTH_STATE,O.OptOut=L.OPT_OUT,A.s_c_in||(A.s_c_il=[],A.s_c_in=0),S._c="Visitor",S._il=A.s_c_il,S._in=A.s_c_in,S._il[S._in]=S,A.s_c_in++,S._instanceType="regular",S._log={requests:[]},S.marketingCloudOrgID=t,S.cookieName="AMCV_"+t,S.sessionCookieName="AMCVS_"+t;var M={};n&&n.secureCookie&&n.sameSiteCookie&&(M={sameSite:n.sameSiteCookie,secure:n.secureCookie}),S.cookieDomain=S.useLocalStorage?"":ee(null,M),S.loadSSL=!0,S.loadTimeout=3e4,S.CORSErrors=[],S.marketingCloudServer=S.audienceManagerServer="dpm.demdex.net",S.sdidParamExpiry=30;var k=null,E="MC",T="MCMID",P="MCIDTS",R="A",w="MCAID",x="AAM",N="MCAAMB",F="NONE",j=function(e){return!Object.prototype[e]},V=ae(S);S.FIELDS=L.FIELDS,S.cookieRead=function(e){return S.useLocalStorage?e===S.sessionCookieName?sessionStorage.getItem(e):localStorage.getItem(e):Z.get(e)},S.cookieWrite=function(e,t,n){var i=""+t;if(S.useLocalStorage)return e===S.sessionCookieName?sessionStorage.setItem(e,i):localStorage.setItem(e,i);var r=S.cookieLifetime?(""+S.cookieLifetime).toUpperCase():"",a={expires:n,domain:S.cookieDomain,cookieLifetime:r};return S.configs&&S.configs.secureCookie&&"https:"===location.protocol&&(a.secure=!0),S.configs&&S.configs.sameSiteCookie&&"https:"===location.protocol&&(a.sameSite=L.SAME_SITE_VALUES[S.configs.sameSiteCookie.toUpperCase()]||"Lax"),Z.set(e,i,a)},S.removeCookie=function(e){if(S.useLocalStorage)return e===S.sessionCookieName?sessionStorage.removeItem(e):localStorage.removeItem(e);var t={domain:S.cookieDomain};return S.configs&&S.configs.secureCookie&&"https:"===location.protocol&&(t.secure=!0),S.configs&&S.configs.sameSiteCookie&&"https:"===location.protocol&&(t.sameSite=L.SAME_SITE_VALUES[S.configs.sameSiteCookie.toUpperCase()]||"Lax"),Z.remove(e,t)},S.resetState=function(e){e?S._mergeServerState(e):s()},S._isAllowedDone=!1,S._isAllowedFlag=!1,S.isAllowed=function(){return S._isAllowedDone||(S._isAllowedDone=!0,(S.cookieRead(S.cookieName)||S.cookieWrite(S.cookieName,"T",1))&&(S._isAllowedFlag=!0)),"T"===S.cookieRead(S.cookieName)&&S.removeCookie(S.cookieName),S._isAllowedFlag},S.setMarketingCloudVisitorID=function(e){S._setMarketingCloudFields(e)},S._use1stPartyMarketingCloudServer=!1,S.getMarketingCloudVisitorID=function(e,t){S.marketingCloudServer&&S.marketingCloudServer.indexOf(".demdex.net")<0&&(S._use1stPartyMarketingCloudServer=!0);var n=S._getAudienceManagerURLData("_setMarketingCloudFields"),i=n.url;return S._getRemoteField(T,i,e,t,n)};var H=function(e,t){var n={};S.getMarketingCloudVisitorID(function(){t.forEach(function(e){n[e]=S._getField(e,!0)}),-1!==t.indexOf("MCOPTOUT")?S.isOptedOut(function(t){n.MCOPTOUT=t,e(n)},null,!0):e(n)},!0)};S.getVisitorValues=function(e,t){var n={MCMID:{fn:S.getMarketingCloudVisitorID,args:[!0],context:S},MCOPTOUT:{fn:S.isOptedOut,args:[void 0,!0],context:S},MCAID:{fn:S.getAnalyticsVisitorID,args:[!0],context:S},MCAAMLH:{fn:S.getAudienceManagerLocationHint,args:[!0],context:S},MCAAMB:{fn:S.getAudienceManagerBlob,args:[!0],context:S}},i=t&&t.length?U.pluck(n,t):n;t&&-1===t.indexOf("MCAID")?H(e,t):$(i,e)},S._currentCustomerIDs={},S._customerIDsHashChanged=!1,S._newCustomerIDsHash="",S.setCustomerIDs=function(t,n){if(!S.isOptedOut()&&t){if(!U.isObject(t)||U.isObjectEmpty(t))return!1;S._readVisitor();var i,a,o,s;for(i in t)if(j(i)&&(S._currentCustomerIDs.dataSources=S._currentCustomerIDs.dataSources||{},a=t[i],n=a.hasOwnProperty("hashType")?a.hashType:n,a))if("object"===e(a)){var c={};if(a.id){if(n){if(!(s=We(Xe(a.id),n)))return;a.id=s,c.hashType=n}c.id=a.id}void 0!=a.authState&&(c.authState=a.authState),S._currentCustomerIDs.dataSources[i]=c}else if(n){if(!(s=We(Xe(a),n)))return;S._currentCustomerIDs.dataSources[i]={id:s,hashType:n}}else S._currentCustomerIDs.dataSources[i]={id:a};var u=S.getCustomerIDs(!0),l=S._getField("MCCIDH"),d="";l||(l=0);for(o in u){var f=u[o];if(!U.isObjectEmpty(f))for(i in f)j(i)&&(a=f[i],d+=(d?"|":"")+i+"|"+(a.id?a.id:"")+(a.authState?a.authState:""))}S._newCustomerIDsHash=String(S._hash(d)),S._newCustomerIDsHash!==l&&(S._customerIDsHashChanged=!0,S._mapCustomerIDs(r))}},S.syncIdentity=function(t,n){if(!S.isOptedOut()&&t){if(!U.isObject(t)||U.isObjectEmpty(t))return!1;S._readVisitor();var i,a,o,s,c;for(i in t)if(j(i)&&(S._currentCustomerIDs.nameSpaces=S._currentCustomerIDs.nameSpaces||{},a=t[i],n=a.hasOwnProperty("hashType")?a.hashType:n,a&&"object"===e(a))){var u={};if(a.id){if(n){if(!(o=We(Xe(a.id),n)))return;a.id=o,u.hashType=n}u.id=a.id}void 0!=a.authState&&(u.authState=a.authState),a.dataSource&&(S._currentCustomerIDs.dataSources=S._currentCustomerIDs.dataSources||{},s=a.dataSource,S._currentCustomerIDs.dataSources[s]=u),S._currentCustomerIDs.nameSpaces[i]=u}var l=S.getCustomerIDs(!0),d=S._getField("MCCIDH"),f="";d||(d="0");for(c in l){var p=l[c];if(!U.isObjectEmpty(p))for(i in p)j(i)&&(a=p[i],f+=(f?"|":"")+i+"|"+(a.id?a.id:"")+(a.authState?a.authState:""))}S._newCustomerIDsHash=String(S._hash(f)),S._newCustomerIDsHash!==d&&(S._customerIDsHashChanged=!0,S._mapCustomerIDs(r))}},S.getCustomerIDs=function(e){S._readVisitor();var t,n,i={dataSources:{},nameSpaces:{}},r=S._currentCustomerIDs.dataSources;for(t in r)j(t)&&(n=r[t],n.id&&(i.dataSources[t]||(i.dataSources[t]={}),i.dataSources[t].id=n.id,void 0!=n.authState?i.dataSources[t].authState=n.authState:i.dataSources[t].authState=O.AuthState.UNKNOWN,n.hashType&&(i.dataSources[t].hashType=n.hashType)));var a=S._currentCustomerIDs.nameSpaces;for(t in a)j(t)&&(n=a[t],n.id&&(i.nameSpaces[t]||(i.nameSpaces[t]={}),i.nameSpaces[t].id=n.id,void 0!=n.authState?i.nameSpaces[t].authState=n.authState:i.nameSpaces[t].authState=O.AuthState.UNKNOWN,n.hashType&&(i.nameSpaces[t].hashType=n.hashType)));return e?i:i.dataSources},S.setAnalyticsVisitorID=function(e){S._setAnalyticsFields(e)},S.getAnalyticsVisitorID=function(e,t,n){if(!q.isTrackingServerPopulated()&&!n)return S._callCallback(e,[""]),"";var i="";if(n||(i=S.getMarketingCloudVisitorID(function(t){S.getAnalyticsVisitorID(e,!0)})),i||n){var r=n?S.marketingCloudServer:S.trackingServer,a="";S.loadSSL&&(n?S.marketingCloudServerSecure&&(r=S.marketingCloudServerSecure):S.trackingServerSecure&&(r=S.trackingServerSecure));var o={};if(r){var s="http"+(S.loadSSL?"s":"")+"://"+r+"/id",c=S.configs.cookieLifetime,u="d_visid_ver="+S.version+"&mcorgid="+encodeURIComponent(S.marketingCloudOrgID)+(i?"&mid="+encodeURIComponent(i):"")+(c?"&cl="+encodeURIComponent(c):"")+(S.idSyncDisable3rdPartySyncing||S.disableThirdPartyCookies?"&d_coppa=true":""),l=["s_c_il",S._in,"_set"+(n?"MarketingCloud":"Analytics")+"Fields"];a=s+"?"+u+"&callback=s_c_il%5B"+S._in+"%5D._set"+(n?"MarketingCloud":"Analytics")+"Fields",o.corsUrl=s+"?"+u,o.callback=l}return o.url=a,S._getRemoteField(n?T:w,a,e,t,o)}return""},S.getAudienceManagerLocationHint=function(e,t){if(S.getMarketingCloudVisitorID(function(t){S.getAudienceManagerLocationHint(e,!0)})){var n=S._getField(w);if(!n&&q.isTrackingServerPopulated()&&(n=S.getAnalyticsVisitorID(function(t){S.getAudienceManagerLocationHint(e,!0)})),n||!q.isTrackingServerPopulated()){var i=S._getAudienceManagerURLData(),r=i.url;return S._getRemoteField("MCAAMLH",r,e,t,i)}}return""},S.getLocationHint=S.getAudienceManagerLocationHint,S.getAudienceManagerBlob=function(e,t){if(S.getMarketingCloudVisitorID(function(t){S.getAudienceManagerBlob(e,!0)})){var n=S._getField(w);if(!n&&q.isTrackingServerPopulated()&&(n=S.getAnalyticsVisitorID(function(t){S.getAudienceManagerBlob(e,!0)})),n||!q.isTrackingServerPopulated()){var i=S._getAudienceManagerURLData(),r=i.url;return S._customerIDsHashChanged&&S._setFieldExpire(N,-1),S._getRemoteField(N,r,e,t,i)}}return""},S._supplementalDataIDCurrent="",S._supplementalDataIDCurrentConsumed={},S._supplementalDataIDLast="",S._supplementalDataIDLastConsumed={},S.getSupplementalDataID=function(e,t){S._supplementalDataIDCurrent||t||(S._supplementalDataIDCurrent=S._generateID(1));var n=S._supplementalDataIDCurrent;return S._supplementalDataIDLast&&!S._supplementalDataIDLastConsumed[e]?(n=S._supplementalDataIDLast,S._supplementalDataIDLastConsumed[e]=!0):n&&(S._supplementalDataIDCurrentConsumed[e]&&(S._supplementalDataIDLast=S._supplementalDataIDCurrent,S._supplementalDataIDLastConsumed=S._supplementalDataIDCurrentConsumed,S._supplementalDataIDCurrent=n=t?"":S._generateID(1),S._supplementalDataIDCurrentConsumed={}),n&&(S._supplementalDataIDCurrentConsumed[e]=!0)),n};var B=!1;S._liberatedOptOut=null,S.getOptOut=function(e,t){var n=S._getAudienceManagerURLData("_setMarketingCloudFields"),i=n.url;if(d())return S._getRemoteField("MCOPTOUT",i,e,t,n);if(S._registerCallback("liberatedOptOut",e),null!==S._liberatedOptOut)return S._callAllCallbacks("liberatedOptOut",[S._liberatedOptOut]),B=!1,S._liberatedOptOut;if(B)return null;B=!0;var r="liberatedGetOptOut";return n.corsUrl=n.corsUrl.replace(/\.demdex\.net\/id\?/,".demdex.net/optOutStatus?"),n.callback=[r],C[r]=function(e){if(e===Object(e)){var t,n,i=U.parseOptOut(e,t,F);t=i.optOut,n=1e3*i.d_ottl,S._liberatedOptOut=t,setTimeout(function(){S._liberatedOptOut=null},n)}S._callAllCallbacks("liberatedOptOut",[t]),B=!1},V.fireCORS(n),null},S.isOptedOut=function(e,t,n){t||(t=O.OptOut.GLOBAL);var i=S.getOptOut(function(n){var i=n===O.OptOut.GLOBAL||n.indexOf(t)>=0;S._callCallback(e,[i])},n);return i?i===O.OptOut.GLOBAL||i.indexOf(t)>=0:null};var G={subscribed:!1,callbacks:[]};S.onReceiveEcid=function(e){if(d())return S.getMarketingCloudVisitorID(e,!0);G.subscribed=!0,e&&"function"==typeof e&&G.callbacks.push(e)},S._fields=null,S._fieldsExpired=null,S._hash=function(e){var t,n,i=0;if(e)for(t=0;t<e.length;t++)n=e.charCodeAt(t),i=(i<<5)-i+n,i&=i;return i},S._generateID=re,S._generateLocalMID=function(){var e=S._generateID(0);return X.isClientSideMarketingCloudVisitorID=!0,e},S._callbackList=null,S._callCallback=function(e,t){try{"function"==typeof e?e.apply(A,t):e[1].apply(e[0],t)}catch(e){}},S._registerCallback=function(e,t){t&&(null==S._callbackList&&(S._callbackList={}),void 0==S._callbackList[e]&&(S._callbackList[e]=[]),S._callbackList[e].push(t))},S._callAllCallbacks=function(e,t){if(null!=S._callbackList){var n=S._callbackList[e];if(n)for(;n.length>0;)S._callCallback(n.shift(),t)}},S._addQuerystringParam=function(e,t,n,i){var r=encodeURIComponent(t)+"="+encodeURIComponent(n),a=q.parseHash(e),o=q.hashlessUrl(e);if(-1===o.indexOf("?"))return o+"?"+r+a;var s=o.split("?"),c=s[0]+"?",u=s[1];return c+q.addQueryParamAtLocation(u,r,i)+a},S._extractParamFromUri=function(e,t){var n=new RegExp("[\\?&#]"+t+"=([^&#]*)"),i=n.exec(e);if(i&&i.length)return decodeURIComponent(i[1])},S._parseAdobeMcFromUrl=a(oe.ADOBE_MC),S._parseAdobeMcSdidFromUrl=a(oe.ADOBE_MC_SDID),S._attemptToPopulateSdidFromUrl=function(e){var n=S._parseAdobeMcSdidFromUrl(e),i=1e9;n&&n.TS&&(i=q.getTimestampInSeconds()-n.TS),n&&n.SDID&&n.MCORGID===t&&i<S.sdidParamExpiry&&(S._supplementalDataIDCurrent=n.SDID,S._supplementalDataIDCurrentConsumed.SDID_URL_PARAM=!0)},S._attemptToPopulateIdsFromUrl=function(){var e=S._parseAdobeMcFromUrl();if(e&&e.TS){var n=q.getTimestampInSeconds(),i=n-e.TS;if(Math.floor(i/60)>oe.ADOBE_MC_TTL_IN_MIN||e.MCORGID!==t)return;o(e)}},S._mergeServerState=function(e){if(e)try{if(e=function(e){return q.isObject(e)?e:JSON.parse(e)}(e),e[S.marketingCloudOrgID]){var t=e[S.marketingCloudOrgID];!function(e){q.isObject(e)&&S.setCustomerIDs(e)}(t.customerIDs),s(t.sdid)}}catch(e){throw new Error("`serverState` has an invalid format.")}},S._timeout=null,S._loadData=function(e,t,n,i){t=S._addQuerystringParam(t,"d_fieldgroup",e,1),i.url=S._addQuerystringParam(i.url,"d_fieldgroup",e,1),i.corsUrl=S._addQuerystringParam(i.corsUrl,"d_fieldgroup",e,1),X.fieldGroupObj[e]=!0,i===Object(i)&&i.corsUrl&&"XMLHttpRequest"===V.corsMetadata.corsType&&V.fireCORS(i,n,e)},S._clearTimeout=function(e){null!=S._timeout&&S._timeout[e]&&(clearTimeout(S._timeout[e]),S._timeout[e]=0)},S._settingsDigest=0,S._getSettingsDigest=function(){if(!S._settingsDigest){var e=S.version;S.audienceManagerServer&&(e+="|"+S.audienceManagerServer),S.audienceManagerServerSecure&&(e+="|"+S.audienceManagerServerSecure),S._settingsDigest=S._hash(e)}return S._settingsDigest},S._readVisitorDone=!1,S._readVisitor=function(){if(!S._readVisitorDone){S._readVisitorDone=!0;var e,t,n,i,r,a,o=S._getSettingsDigest(),s=!1,c=S.cookieRead(S.cookieName),u=new Date;if(c||b||S.discardTrackingServerECID||(c=S.cookieRead(oe.FIRST_PARTY_SERVER_COOKIE)),null==S._fields&&(S._fields={}),c&&"T"!==c)for(c=c.split("|"),c[0].match(/^[\-0-9]+$/)&&(parseInt(c[0],10)!==o&&(s=!0),c.shift()),c.length%2==1&&c.pop(),e=0;e<c.length;e+=2)t=c[e].split("-"),n=t[0],i=c[e+1],t.length>1?(r=parseInt(t[1],10),a=t[1].indexOf("s")>0):(r=0,a=!1),s&&("MCCIDH"===n&&(i=""),r>0&&(r=u.getTime()/1e3-60)),n&&i&&(S._setField(n,i,1),r>0&&(S._fields["expire"+n]=r+(a?"s":""),(u.getTime()>=1e3*r||a&&!S.cookieRead(S.sessionCookieName))&&(S._fieldsExpired||(S._fieldsExpired={}),S._fieldsExpired[n]=!0)));!S._getField(w)&&q.isTrackingServerPopulated()&&(c=S.cookieRead("s_vi"))&&(c=c.split("|"),c.length>1&&c[0].indexOf("v1")>=0&&(i=c[1],e=i.indexOf("["),e>=0&&(i=i.substring(0,e)),i&&i.match(oe.VALID_VISITOR_ID_REGEX)&&S._setField(w,i)))}},S._appendVersionTo=function(e){var t="vVersion|"+S.version,n=e?S._getCookieVersion(e):null;return n?te.areVersionsDifferent(n,S.version)&&(e=e.replace(oe.VERSION_REGEX,t)):e+=(e?"|":"")+t,e},S._writeVisitor=function(){var e,t,n=S._getSettingsDigest();for(e in S._fields)j(e)&&S._fields[e]&&"expire"!==e.substring(0,6)&&(t=S._fields[e],n+=(n?"|":"")+e+(S._fields["expire"+e]?"-"+S._fields["expire"+e]:"")+"|"+t);n=S._appendVersionTo(n),S.cookieWrite(S.cookieName,n,1)},S._getField=function(e,t){return null==S._fields||!t&&S._fieldsExpired&&S._fieldsExpired[e]?null:S._fields[e]},S._setField=function(e,t,n){null==S._fields&&(S._fields={}),S._fields[e]=t,n||S._writeVisitor()},S._getFieldList=function(e,t){var n=S._getField(e,t);return n?n.split("*"):null},S._setFieldList=function(e,t,n){S._setField(e,t?t.join("*"):"",n)},S._getFieldMap=function(e,t){var n=S._getFieldList(e,t);if(n){var i,r={};for(i=0;i<n.length;i+=2)r[n[i]]=n[i+1];return r}return null},S._setFieldMap=function(e,t,n){var i,r=null;if(t){r=[];for(i in t)j(i)&&(r.push(i),r.push(t[i]))}S._setFieldList(e,r,n)},S._setFieldExpire=function(e,t,n){var i=new Date;i.setTime(i.getTime()+1e3*t),null==S._fields&&(S._fields={}),S._fields["expire"+e]=Math.floor(i.getTime()/1e3)+(n?"s":""),t<0?(S._fieldsExpired||(S._fieldsExpired={}),S._fieldsExpired[e]=!0):S._fieldsExpired&&(S._fieldsExpired[e]=!1),n&&(S.cookieRead(S.sessionCookieName)||S.cookieWrite(S.sessionCookieName,"1"))},S._findVisitorID=function(t){return t&&("object"===e(t)&&(t=t.d_mid?t.d_mid:t.visitorID?t.visitorID:t.id?t.id:t.uuid?t.uuid:""+t),t&&"NOTARGET"===(t=t.toUpperCase())&&(t=F),t&&(t===F||t.match(oe.VALID_VISITOR_ID_REGEX))||(t="")),t},S._setFields=function(t,n){if(S._clearTimeout(t),null!=S._loading&&(S._loading[t]=!1),X.fieldGroupObj[t]&&X.setState(t,!1),t===E){!0!==X.isClientSideMarketingCloudVisitorID&&(X.isClientSideMarketingCloudVisitorID=!1);var i=S._getField(T);if(!i||S.overwriteCrossDomainMCIDAndAID){if(!(i="object"===e(n)&&n.mid?n.mid:S._findVisitorID(n))){if(S._use1stPartyMarketingCloudServer&&!S.tried1stPartyMarketingCloudServer)return S.tried1stPartyMarketingCloudServer=!0,void S.getAnalyticsVisitorID(null,!1,!0);i=S._generateLocalMID()}S._setField(T,i)}i&&i!==F||(i=""),"object"===e(n)&&((n.d_region||n.dcs_region||n.d_blob||n.blob)&&S._setFields(x,n),S._use1stPartyMarketingCloudServer&&n.mid&&S._setFields(R,{id:n.id})),S._callAllCallbacks(T,[i])}if(t===x&&"object"===e(n)){var r=604800;void 0!=n.id_sync_ttl&&n.id_sync_ttl&&(r=parseInt(n.id_sync_ttl,10));var a=W.getRegionAndCheckIfChanged(n,r);S._callAllCallbacks("MCAAMLH",[a]);var o=S._getField(N);(n.d_blob||n.blob)&&(o=n.d_blob,o||(o=n.blob),S._setFieldExpire(N,r),S._setField(N,o)),o||(o=""),S._callAllCallbacks(N,[o]),!n.error_msg&&S._newCustomerIDsHash&&S._setField("MCCIDH",S._newCustomerIDsHash)}if(t===R){var s=S._getField(w);s&&!S.overwriteCrossDomainMCIDAndAID||(s=S._findVisitorID(n),s?s!==F&&S._setFieldExpire(N,-1):s=F,S._setField(w,s)),s&&s!==F||(s=""),S._callAllCallbacks(w,[s])}if(S.idSyncDisableSyncs||S.disableIdSyncs)W.idCallNotProcesssed=!0;else{W.idCallNotProcesssed=!1;var c={};c.ibs=n.ibs,c.subdomain=n.subdomain,W.processIDCallData(c)}if(n===Object(n)){var u,l;d()&&S.isAllowed()&&(u=S._getField("MCOPTOUT"));var f=U.parseOptOut(n,u,F);u=f.optOut,l=f.d_ottl,S._setFieldExpire("MCOPTOUT",l,!0),S._setField("MCOPTOUT",u),S._callAllCallbacks("MCOPTOUT",[u])}},S._loading=null,S._getRemoteField=function(e,t,n,i,r){var a,o="",s=q.isFirstPartyAnalyticsVisitorIDCall(e),c={MCAAMLH:!0,MCAAMB:!0};if(d()&&S.isAllowed()){S._readVisitor(),o=S._getField(e,!0===c[e]);if(function(){return(!o||S._fieldsExpired&&S._fieldsExpired[e])&&(!S.disableThirdPartyCalls||s)}()){if(e===T||"MCOPTOUT"===e?a=E:"MCAAMLH"===e||e===N?a=x:e===w&&(a=R),a)return!t||null!=S._loading&&S._loading[a]||(null==S._loading&&(S._loading={}),S._loading[a]=!0,a===x&&(D=0),S._loadData(a,t,function(t){if(!S._getField(e)){t&&X.setState(a,!0);var n="";e===T?n=S._generateLocalMID():a===x&&(n={error_msg:"timeout"}),S._setFields(a,n)}},r)),S._registerCallback(e,n),o||(t||S._setFields(a,{id:F}),"")}else o||(e===T?(S._registerCallback(e,n),o=S._generateLocalMID(),S.setMarketingCloudVisitorID(o)):e===w?(S._registerCallback(e,n),o="",S.setAnalyticsVisitorID(o)):(o="",i=!0))}return e!==T&&e!==w||o!==F||(o="",i=!0),n&&i&&S._callCallback(n,[o]),e===T&&G.subscribed&&(G.callbacks&&G.callbacks.length&&G.callbacks.forEach(function(e){S._callCallback(e,[o])}),G.subscribed=!1,G.callbacks.length=0),o},S._setMarketingCloudFields=function(e){S._readVisitor(),S._setFields(E,e)},S._mapCustomerIDs=function(e){S.getAudienceManagerBlob(e,!0)},S._setAnalyticsFields=function(e){S._readVisitor(),S._setFields(R,e)},S._setAudienceManagerFields=function(e){S._readVisitor(),S._setFields(x,e)},S._getAudienceManagerURLData=function(e){var t=S.audienceManagerServer,n="",i=S._getField(T),r=S._getField(N,!0),a=S._getField(w),o=a&&a!==F?"&d_cid_ic=AVID%01"+encodeURIComponent(a):"";if(S.loadSSL&&S.audienceManagerServerSecure&&(t=S.audienceManagerServerSecure),t){var s,c,u,l=S.getCustomerIDs(!0);if(l)for(c in l){var d=l[c];if(!U.isObjectEmpty(d)){var f="nameSpaces"===c?"&d_cid_ns=":"&d_cid_ic=";for(s in d)j(s)&&(u=d[s],o+=f+encodeURIComponent(s)+"%01"+encodeURIComponent(u.id?u.id:"")+(u.authState?"%01"+u.authState:""))}}e||(e="_setAudienceManagerFields");var p="http"+(S.loadSSL?"s":"")+"://"+t+"/id",g="d_visid_ver="+S.version+(v&&-1!==p.indexOf("demdex.net")?"&gdpr=1&gdpr_consent="+v:"")+(D&&-1!==p.indexOf("demdex.net")?"&d_cf="+D:"")+"&d_rtbd=json&d_ver=2"+(!i&&S._use1stPartyMarketingCloudServer?"&d_verify=1":"")+"&d_orgid="+encodeURIComponent(S.marketingCloudOrgID)+"&d_nsid="+(S.idSyncContainerID||0)+(i?"&d_mid="+encodeURIComponent(i):"")+(S.idSyncDisable3rdPartySyncing||S.disableThirdPartyCookies?"&d_coppa=true":"")+(!0===k?"&d_coop_safe=1":!1===k?"&d_coop_unsafe=1":"")+(r?"&d_blob="+encodeURIComponent(r):"")+o,m=["s_c_il",S._in,e];return n=p+"?"+g+"&d_cb=s_c_il%5B"+S._in+"%5D."+e,{url:n,corsUrl:p+"?"+g,callback:m}}return{url:n}},S.appendVisitorIDsTo=function(e){try{var t=[[T,S._getField(T)],[w,S._getField(w)],["MCORGID",S.marketingCloudOrgID]];return S._addQuerystringParam(e,oe.ADOBE_MC,c(t))}catch(t){return e}},S.appendSupplementalDataIDTo=function(e,t){if(!(t=t||S.getSupplementalDataID(q.generateRandomString(),!0)))return e;try{var n=c([["SDID",t],["MCORGID",S.marketingCloudOrgID]]);return S._addQuerystringParam(e,oe.ADOBE_MC_SDID,n)}catch(t){return e}};var q={parseHash:function(e){var t=e.indexOf("#");return t>0?e.substr(t):""},hashlessUrl:function(e){var t=e.indexOf("#");return t>0?e.substr(0,t):e},addQueryParamAtLocation:function(e,t,n){var i=e.split("&");return n=null!=n?n:i.length,i.splice(n,0,t),i.join("&")},isFirstPartyAnalyticsVisitorIDCall:function(e,t,n){if(e!==w)return!1;var i;return t||(t=S.trackingServer),n||(n=S.trackingServerSecure),!("string"!=typeof(i=S.loadSSL?n:t)||!i.length)&&(i.indexOf("2o7.net")<0&&i.indexOf("omtrdc.net")<0)},isObject:function(e){return Boolean(e&&e===Object(e))},removeCookie:function(e){Z.remove(e,{domain:S.cookieDomain})},isTrackingServerPopulated:function(){return!!S.trackingServer||!!S.trackingServerSecure},getTimestampInSeconds:function(){return Math.round((new Date).getTime()/1e3)},parsePipeDelimetedKeyValues:function(e){return e.split("|").reduce(function(e,t){var n=t.split("=");return e[n[0]]=decodeURIComponent(n[1]),e},{})},generateRandomString:function(e){e=e||5;for(var t="",n="abcdefghijklmnopqrstuvwxyz0123456789";e--;)t+=n[Math.floor(Math.random()*n.length)];return t},normalizeBoolean:function(e){return"true"===e||"false"!==e&&e},parseBoolean:function(e){return"true"===e||"false"!==e&&null},replaceMethodsWithFunction:function(e,t){for(var n in e)e.hasOwnProperty(n)&&"function"==typeof e[n]&&(e[n]=t);return e}};S._helpers=q;var W=se(S,O);S._destinationPublishing=W,S.timeoutMetricsLog=[];var X={isClientSideMarketingCloudVisitorID:null,MCIDCallTimedOut:null,AnalyticsIDCallTimedOut:null,AAMIDCallTimedOut:null,fieldGroupObj:{},setState:function(e,t){switch(e){case E:!1===t?!0!==this.MCIDCallTimedOut&&(this.MCIDCallTimedOut=!1):this.MCIDCallTimedOut=t;break;case R:!1===t?!0!==this.AnalyticsIDCallTimedOut&&(this.AnalyticsIDCallTimedOut=!1):this.AnalyticsIDCallTimedOut=t;break;case x:!1===t?!0!==this.AAMIDCallTimedOut&&(this.AAMIDCallTimedOut=!1):this.AAMIDCallTimedOut=t}}};S.isClientSideMarketingCloudVisitorID=function(){return X.isClientSideMarketingCloudVisitorID},S.MCIDCallTimedOut=function(){return X.MCIDCallTimedOut},S.AnalyticsIDCallTimedOut=function(){return X.AnalyticsIDCallTimedOut},S.AAMIDCallTimedOut=function(){return X.AAMIDCallTimedOut},S.idSyncGetOnPageSyncInfo=function(){return S._readVisitor(),S._getField("MCSYNCSOP")},S.idSyncByURL=function(e){if(!S.isOptedOut()){var t=u(e||{});if(t.error)return t.error;var n,i,r=e.url,a=encodeURIComponent,o=W;return r=r.replace(/^https:/,"").replace(/^http:/,""),n=U.encodeAndBuildRequest(["",e.dpid,e.dpuuid||""],","),i=["ibs",a(e.dpid),"img",a(r),t.ttl,"",n],o.addMessage(i.join("|")),o.requestToProcess(),"Successfully queued"}},S.idSyncByDataSource=function(e){if(!S.isOptedOut())return e===Object(e)&&"string"==typeof e.dpuuid&&e.dpuuid.length?(e.url="//dpm.demdex.net/ibs:dpid="+e.dpid+"&dpuuid="+e.dpuuid,S.idSyncByURL(e)):"Error: config or config.dpuuid is empty"},Ye(S,W),S._getCookieVersion=function(e){e=e||S.cookieRead(S.cookieName);var t=oe.VERSION_REGEX.exec(e);return t&&t.length>1?t[1]:null},S._resetAmcvCookie=function(e){var t=S._getCookieVersion();t&&!te.isLessThan(t,e)||S.removeCookie(S.cookieName)},S.setAsCoopSafe=function(){k=!0},S.setAsCoopUnsafe=function(){k=!1},function(){if(S.configs=Object.create(null),q.isObject(n))for(var e in n)j(e)&&(S[e]=n[e],S.configs[e]=n[e])}(),f();var K;S.init=function(){l()&&(I.optIn.fetchPermissions(h,!0),!I.optIn.isApproved(I.optIn.Categories.ECID))||K||(K=!0,function(){if(q.isObject(n)){S.idSyncContainerID=S.idSyncContainerID||0,k="boolean"==typeof S.isCoopSafe?S.isCoopSafe:q.parseBoolean(S.isCoopSafe),S.resetBeforeVersion&&S._resetAmcvCookie(S.resetBeforeVersion),S._attemptToPopulateIdsFromUrl(),S._attemptToPopulateSdidFromUrl(),S._readVisitor();var e=S._getField(P),t=Math.ceil((new Date).getTime()/oe.MILLIS_PER_DAY);S.idSyncDisableSyncs||S.disableIdSyncs||!W.canMakeSyncIDCall(e,t)||(S._setFieldExpire(N,-1),S._setField(P,t)),S.getMarketingCloudVisitorID(),S.getAudienceManagerLocationHint(),S.getAudienceManagerBlob(),S._mergeServerState(S.serverState)}else S._attemptToPopulateIdsFromUrl(),S._attemptToPopulateSdidFromUrl()}(),function(){if(!S.idSyncDisableSyncs&&!S.disableIdSyncs){W.checkDPIframeSrc();var e=function(){var e=W;e.readyToAttachIframe()&&e.attachIframe()};A.addEventListener("load",function(){O.windowLoaded=!0,e()});try{ie.receiveMessage(function(e){W.receiveMessage(e.data)},W.iframeHost)}catch(e){}}}(),function(){S.whitelistIframeDomains&&oe.POST_MESSAGE_ENABLED&&(S.whitelistIframeDomains=S.whitelistIframeDomains instanceof Array?S.whitelistIframeDomains:[S.whitelistIframeDomains],S.whitelistIframeDomains.forEach(function(e){var n=new Y(t,e),i=Q(S,n);ie.receiveMessage(i,e)}))}())}};Je.config=ue,C.Visitor=Je;var ze=Je,Qe=function(e){if(U.isObject(e))return Object.keys(e).filter(function(t){return""!==e[t]&&ue.getConfigs()[t]}).reduce(function(t,n){var i=ue.normalizeConfig(n,e[n]),r=U.normalizeBoolean(i);return t[n]=r,t},Object.create(null))},$e=Ge.OptIn,Ze=Ge.IabPlugin;return ze.getInstance=function(e,t){if(!e)throw new Error("Visitor requires Adobe Marketing Cloud Org ID.");e.indexOf("@")<0&&(e+="@AdobeOrg");var n=function(){var t=C.s_c_il;if(t)for(var n=0;n<t.length;n++){var i=t[n];if(i&&"Visitor"===i._c&&i.marketingCloudOrgID===e)return i}}();if(n)return n;var i=Qe(t)||{};!function(e){C.adobe.optIn=C.adobe.optIn||function(){var t=U.pluck(e,["doesOptInApply","previousPermissions","preOptInApprovals","isOptInStorageEnabled","optInStorageExpiry","isIabContext","sameSiteCookie","secureCookie"]),n=e.optInCookieDomain||e.cookieDomain;n=n||ee(),n=n===window.location.hostname?"":n,t.optInCookieDomain=n;var i=new $e(t,{cookies:Z});if(t.isIabContext&&t.doesOptInApply){var r=new Ze;i.registerPlugin(r)}return i}()}(i||{});var r=e,a=r.split("").reverse().join(""),o=new ze(e,null,a);i.cookieDomain&&(o.cookieDomain=i.cookieDomain),i.sameSiteCookie&&i.secureCookie&&(o.configs={sameSiteCookie:i.sameSiteCookie,secureCookie:i.secureCookie}),function(){
	C.s_c_il.splice(--C.s_c_in,1)}();var s=U.getIeVersion();if("number"==typeof s&&s<10)return o._helpers.replaceMethodsWithFunction(o,function(){});var c=function(){try{return C.self!==C.parent}catch(e){return!0}}()&&(!function(e){return e.cookieWrite("TEST_AMCV_COOKIE","T",1),"T"===e.cookieRead("TEST_AMCV_COOKIE")&&(e.removeCookie("TEST_AMCV_COOKIE"),!0)}(o)||U.isFirefox()&&!i.whitelistParentDomain)&&C.parent?new W(e,i,o,C.parent):new ze(e,i,a);return o=null,c.init(),c},function(){function e(){ze.windowLoaded=!0}C.addEventListener?C.addEventListener("load",e):C.attachEvent&&C.attachEvent("onload",e),ze.codeLoadEnd=(new Date).getTime()}(),ze}();

  return Visitor;
}();

          }

        },
        "adobe-mcid/src/view/utils/timeUnits.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2018 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

var timeUnits = {
  Hours: 3600,
  Days: 24 * 3600,
  Weeks: 7 * 24 * 3600,
  Months: 30 * 24 * 3600,
  Years: 365 * 24 * 3600
};

module.exports = timeUnits;

          }

        }
      }
    }
  },
  "company": {
    "orgId": "0B96B03459707BE40A495C70@AdobeOrg",
    "dynamicCdnEnabled": false
  },
  "property": {
    "name": "Test Property - NG",
    "settings": {
      "domains": [
        "newco.activate.bounteous.com"
      ],
      "undefinedVarsReturnEmpty": false,
      "ruleComponentSequencingEnabled": true
    },
    "id": "PR664542eecb0b4a158b15aa293f2dcb33"
  },
  "rules": [

  ]
}
})();

var _satellite = (function () {
	'use strict';

	if (!window.atob) { console.warn('Adobe Launch is unsupported in IE 9 and below.'); return; }

	var reactorDocument = document;

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
	/* eslint-disable no-unused-vars */
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (err) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty$1.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};

	var reactorObjectAssign = objectAssign;

	var reactorWindow = window;

	/***************************************************************************************
	 * (c) 2021 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var createDynamicHostResolver = function (
	  turbineEmbedCode,
	  dynamicCdnEnabled,
	  cdnAllowList,
	  debugController
	) {
	  // A missing list means that we are not trying to dynamic replace (archives,
	  // sftp, no premium CDN option enabled on the company).
	  // even an empty list is flagging to us that we're trying to enforce dynamic
	  var isDynamicEnforced = Boolean(
	    dynamicCdnEnabled && Array.isArray(cdnAllowList)
	  );
	  var shouldAugment = Boolean(isDynamicEnforced && turbineEmbedCode);

	  // using document.createElement('a') because IE10/11 doesn't support new URL()
	  var turbineUrl = document.createElement('a');
	  if (isDynamicEnforced) {
	    var throwUnavailableEmbedCode = function () {
	      var missingEmbedCodeError = new Error(
	        'Unable to find the Library Embed Code for Dynamic Host Resolution.'
	      );
	      missingEmbedCodeError.code = 'dynamic_host_resolver_constructor_error';
	      throw missingEmbedCodeError;
	    };
	    if (turbineEmbedCode) {
	      if (!/^((https?:)?\/\/).+/.test(turbineEmbedCode)) {
	        throwUnavailableEmbedCode();
	      }
	      if (/^\/\/.+/.test(turbineEmbedCode)) {
	        // for IE 10, you must throw on the protocol
	        turbineUrl.href = reactorWindow.location.protocol + turbineEmbedCode;
	      } else {
	        turbineUrl.href = turbineEmbedCode;
	      }
	    }

	    // check URL construction
	    if (!turbineUrl.hostname) {
	      throwUnavailableEmbedCode();
	    }
	    // is this within the allowed list of hosts?
	    if (cdnAllowList.indexOf(turbineUrl.hostname) === -1) {
	      var dynamicDeniedError = new Error(
	        'This library is not authorized for this domain. ' +
	          'Please contact your CSM for more information.'
	      );
	      dynamicDeniedError.code = 'dynamic_host_not_allowed';
	      throw dynamicDeniedError;
	    }
	  }

	  /**
	   * Returns the host of the Turbine embed code, or an empty string if Dynamic Host
	   * is not enabled.
	   * @returns {string}
	   */
	  var memoizedHostResult;
	  var getTurbineHost = function () {
	    if (memoizedHostResult != null) {
	      return memoizedHostResult;
	    }

	    if (shouldAugment) {
	      // be sure we always force https to Adobe managed domains.
	      // IE 10/11 returns the :443 protocol when modern browsers don't, so this replacement
	      // is bringing every browser in line with the same return value
	      var sanitizedHost = turbineUrl.host;
	      if (/:80$/.test(sanitizedHost)) {
	        sanitizedHost = sanitizedHost.replace(':80', '');
	      } else if (/:80\/$/.test(sanitizedHost)) {
	        sanitizedHost = sanitizedHost.replace(':80/', '');
	      } else if (/:443$/.test(sanitizedHost)) {
	        sanitizedHost = sanitizedHost.replace(':443', '');
	      } else if (/:443\/$/.test(sanitizedHost)) {
	        sanitizedHost = sanitizedHost.replace(':443/', '');
	      }

	      memoizedHostResult = turbineUrl.protocol + '//' + sanitizedHost;
	    } else {
	      memoizedHostResult = '';
	    }

	    return memoizedHostResult;
	  };

	  /**
	   * Returns a url decorated with the host of the Turbine embed code. If Dynamic host
	   * is disabled, the original sourceUrl is returned unmodified.
	   * @param sourceUrl
	   * @returns {string|*}
	   */
	  var decorateWithDynamicHost = function (sourceUrl) {
	    if (shouldAugment && typeof sourceUrl === 'string') {
	      var urlParts = [
	        getTurbineHost(),
	        sourceUrl.charAt(0) === '/' ? sourceUrl.slice(1) : sourceUrl
	      ];

	      return urlParts.join('/');
	    }

	    return sourceUrl;
	  };

	  var dynamicHostResolver = {
	    getTurbineHost: getTurbineHost,
	    decorateWithDynamicHost: decorateWithDynamicHost,
	    get isDynamicEnforced() {
	      return isDynamicEnforced;
	    }
	  };

	  if (reactorWindow) {
	    debugController.onDebugChanged(function (isEnabled) {
	      if (isEnabled) {
	        reactorWindow.dynamicHostResolver = dynamicHostResolver;
	      } else {
	        delete reactorWindow.dynamicHostResolver;
	      }
	    });
	  }

	  return dynamicHostResolver;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Rules can be ordered by users at the event type level. For example, assume both Rule A and Rule B
	 * use the Library Loaded and Window Loaded event types. Rule A can be ordered to come before Rule B
	 * on Library Loaded but after Rule B on Window Loaded.
	 *
	 * Order values are integers and act more as a priority. In other words, multiple rules can have the
	 * same order value. If they have the same order value, their order of execution should be
	 * considered nondetermistic.
	 *
	 * @param {Array} rules
	 * @returns {Array} An ordered array of rule-event pair objects.
	 */
	var buildRuleExecutionOrder = function (rules) {
	  var ruleEventPairs = [];

	  rules.forEach(function (rule) {
	    if (rule.events) {
	      rule.events.forEach(function (event) {
	        ruleEventPairs.push({
	          rule: rule,
	          event: event
	        });
	      });
	    }
	  });

	  return ruleEventPairs.sort(function (ruleEventPairA, ruleEventPairB) {
	    return ruleEventPairA.event.ruleOrder - ruleEventPairB.event.ruleOrder;
	  });
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var DEBUG_LOCAL_STORAGE_NAME = 'debug';

	var createDebugController = function (localStorage, logger) {
	  var getPersistedDebugEnabled = function () {
	    return localStorage.getItem(DEBUG_LOCAL_STORAGE_NAME) === 'true';
	  };

	  var setPersistedDebugEnabled = function (enabled) {
	    localStorage.setItem(DEBUG_LOCAL_STORAGE_NAME, enabled);
	  };

	  var debugChangedCallbacks = [];
	  var onDebugChanged = function (callback) {
	    debugChangedCallbacks.push(callback);
	  };

	  logger.outputEnabled = getPersistedDebugEnabled();

	  return {
	    onDebugChanged: onDebugChanged,
	    getDebugEnabled: getPersistedDebugEnabled,
	    setDebugEnabled: function (enabled) {
	      if (getPersistedDebugEnabled() !== enabled) {
	        setPersistedDebugEnabled(enabled);
	        logger.outputEnabled = enabled;
	        debugChangedCallbacks.forEach(function (callback) {
	          callback(enabled);
	        });
	      }
	    }
	  };
	};

	/***************************************************************************************
	 * (c) 2018 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	var MODULE_NOT_FUNCTION_ERROR = 'Module did not export a function.';

	var createExecuteDelegateModule = function (
	  moduleProvider,
	  replaceTokens,
	  settingsFileTransformer
	) {
	  return function (moduleDescriptor, syntheticEvent, moduleCallParameters) {
	    moduleCallParameters = moduleCallParameters || [];
	    var moduleExports = moduleProvider.getModuleExports(
	      moduleDescriptor.modulePath
	    );

	    if (typeof moduleExports !== 'function') {
	      throw new Error(MODULE_NOT_FUNCTION_ERROR);
	    }

	    // dynamically replace the host on the module settings
	    var moduleDefinition = moduleProvider.getModuleDefinition(
	      moduleDescriptor.modulePath
	    );

	    // We're transforming URLs in-place to ensure that the developer's settings object reference
	    // is the same object reference as moduleDescriptor.settings. Therefore, we must only transform
	    // the settings one time and save a reference saying that we've done that. We're saving this in
	    // the module descriptor of each event, condition, and action so that we aren't modifying the
	    // settings object.
	    var moduleSettings = moduleDescriptor.settings || {};
	    if (
	      !moduleDescriptor.hasTransformedFilePaths &&
	      moduleDefinition.filePaths
	    ) {
	      settingsFileTransformer(
	        moduleSettings,
	        moduleDefinition.filePaths,
	        moduleDescriptor.modulePath
	      );
	      moduleDescriptor.hasTransformedFilePaths = true;
	    }

	    // replace tokens
	    var moduleDescriptorSettings = replaceTokens(
	      moduleSettings,
	      syntheticEvent
	    );
	    return moduleExports
	      .bind(null, moduleDescriptorSettings)
	      .apply(null, moduleCallParameters);
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * "Cleans" text by trimming the string and removing spaces and newlines.
	 * @param {string} str The string to clean.
	 * @returns {string}
	 */
	var cleanText = function (str) {
	  return typeof str === 'string' ? str.replace(/\s+/g, ' ').trim() : str;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Log levels.
	 * @readonly
	 * @enum {string}
	 * @private
	 */
	var levels = {
	  LOG: 'log',
	  INFO: 'info',
	  DEBUG: 'debug',
	  WARN: 'warn',
	  ERROR: 'error'
	};

	/**
	 * Rocket unicode surrogate pair.
	 * @type {string}
	 */
	var ROCKET = '\uD83D\uDE80';

	/**
	 * The user's internet explorer version. If they're not running internet explorer, then it should
	 * be NaN.
	 * @type {Number}
	 */
	var ieVersion = parseInt(
	  (/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]
	);

	/**
	 * Prefix to use on all messages. The rocket unicode doesn't work on IE 10.
	 * @type {string}
	 */
	var launchPrefix = ieVersion === 10 ? '[Launch]' : ROCKET;

	/**
	 * Whether logged messages should be output to the console.
	 * @type {boolean}
	 */
	var outputEnabled = false;

	/**
	 * Processes a log message.
	 * @param {string} level The level of message to log.
	 * @param {...*} arg Any argument to be logged.
	 * @private
	 */
	var process = function (level) {
	  if (outputEnabled && window.console) {
	    var logArguments = Array.prototype.slice.call(arguments, 1);
	    logArguments.unshift(launchPrefix);
	    // window.debug is unsupported in IE 10
	    if (level === levels.DEBUG && !window.console[level]) {
	      level = levels.INFO;
	    }
	    window.console[level].apply(window.console, logArguments);
	  }
	};

	/**
	 * Outputs a message to the web console.
	 * @param {...*} arg Any argument to be logged.
	 */
	var log = process.bind(null, levels.LOG);

	/**
	 * Outputs informational message to the web console. In some browsers a small "i" icon is
	 * displayed next to these items in the web console's log.
	 * @param {...*} arg Any argument to be logged.
	 */
	var info = process.bind(null, levels.INFO);

	/**
	 * Outputs debug message to the web console. In browsers that do not support
	 * console.debug, console.info is used instead.
	 * @param {...*} arg Any argument to be logged.
	 */
	var debug = process.bind(null, levels.DEBUG);

	/**
	 * Outputs a warning message to the web console.
	 * @param {...*} arg Any argument to be logged.
	 */
	var warn = process.bind(null, levels.WARN);

	/**
	 * Outputs an error message to the web console.
	 * @param {...*} arg Any argument to be logged.
	 */
	var error = process.bind(null, levels.ERROR);

	/**
	 * Outputs a warning message to the web console.
	 * @param {...*} arg Any argument to be logged.
	 */
	var logDeprecation = function () {
	  var wasEnabled = outputEnabled;
	  outputEnabled = true;

	  process.apply(
	    null,
	    Array.prototype.concat(levels.WARN, Array.prototype.slice.call(arguments))
	  );

	  if (!wasEnabled) {
	    outputEnabled = false;
	  }
	};

	var logger = {
	  log: log,
	  info: info,
	  debug: debug,
	  warn: warn,
	  error: error,
	  deprecation: logDeprecation,
	  /**
	   * Whether logged messages should be output to the console.
	   * @type {boolean}
	   */
	  get outputEnabled() {
	    return outputEnabled;
	  },
	  set outputEnabled(value) {
	    outputEnabled = value;
	  },
	  /**
	   * Creates a logging utility that only exposes logging functionality and prefixes all messages
	   * with an identifier.
	   */
	  createPrefixedLogger: function (identifier) {
	    var loggerSpecificPrefix = '[' + identifier + ']';

	    return {
	      log: log.bind(null, loggerSpecificPrefix),
	      info: info.bind(null, loggerSpecificPrefix),
	      debug: debug.bind(null, loggerSpecificPrefix),
	      warn: warn.bind(null, loggerSpecificPrefix),
	      error: error.bind(null, loggerSpecificPrefix)
	    };
	  }
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var NAMESPACE = 'com.adobe.reactor.';

	var getNamespacedStorage = function (storageType, additionalNamespace) {
	  var finalNamespace = NAMESPACE + (additionalNamespace || '');

	  // When storage is disabled on Safari, the mere act of referencing window.localStorage
	  // or window.sessionStorage throws an error. For this reason, we wrap in a try-catch.
	  return {
	    /**
	     * Reads a value from storage.
	     * @param {string} name The name of the item to be read.
	     * @returns {string}
	     */
	    getItem: function (name) {
	      try {
	        return reactorWindow[storageType].getItem(finalNamespace + name);
	      } catch (e) {
	        return null;
	      }
	    },
	    /**
	     * Saves a value to storage.
	     * @param {string} name The name of the item to be saved.
	     * @param {string} value The value of the item to be saved.
	     * @returns {boolean} Whether the item was successfully saved to storage.
	     */
	    setItem: function (name, value) {
	      try {
	        reactorWindow[storageType].setItem(finalNamespace + name, value);
	        return true;
	      } catch (e) {
	        return false;
	      }
	    }
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var DATA_ELEMENTS_NAMESPACE = 'dataElements.';

	var dataElementSessionStorage = getNamespacedStorage(
	  'sessionStorage',
	  DATA_ELEMENTS_NAMESPACE
	);
	var dataElementLocalStorage = getNamespacedStorage(
	  'localStorage',
	  DATA_ELEMENTS_NAMESPACE
	);

	var storageDurations = {
	  PAGEVIEW: 'pageview',
	  SESSION: 'session',
	  VISITOR: 'visitor'
	};

	var pageviewCache = {};

	var serialize = function (value) {
	  var serialized;

	  try {
	    // On some browsers, with some objects, errors will be thrown during serialization. For example,
	    // in Chrome with the window object, it will throw "TypeError: Converting circular structure
	    // to JSON"
	    serialized = JSON.stringify(value);
	    // eslint-disable-next-line no-empty
	  } catch (e) {}

	  return serialized;
	};

	var setValue = function (key, storageDuration, value) {
	  var serializedValue;

	  switch (storageDuration) {
	    case storageDurations.PAGEVIEW:
	      pageviewCache[key] = value;
	      return;
	    case storageDurations.SESSION:
	      serializedValue = serialize(value);
	      if (serializedValue) {
	        dataElementSessionStorage.setItem(key, serializedValue);
	      }
	      return;
	    case storageDurations.VISITOR:
	      serializedValue = serialize(value);
	      if (serializedValue) {
	        dataElementLocalStorage.setItem(key, serializedValue);
	      }
	      return;
	  }
	};

	var getValue = function (key, storageDuration) {
	  var value;

	  // It should consistently return the same value if no stored item was found. We chose null,
	  // though undefined could be a reasonable value as well.
	  switch (storageDuration) {
	    case storageDurations.PAGEVIEW:
	      return pageviewCache.hasOwnProperty(key) ? pageviewCache[key] : null;
	    case storageDurations.SESSION:
	      value = dataElementSessionStorage.getItem(key);
	      return value === null ? value : JSON.parse(value);
	    case storageDurations.VISITOR:
	      value = dataElementLocalStorage.getItem(key);
	      return value === null ? value : JSON.parse(value);
	  }
	};

	var dataElementSafe = {
	  setValue: setValue,
	  getValue: getValue
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var getErrorMessage = function (
	  dataDef,
	  dataElementName,
	  errorMessage,
	  errorStack
	) {
	  return (
	    'Failed to execute data element module ' +
	    dataDef.modulePath +
	    ' for data element ' +
	    dataElementName +
	    '. ' +
	    errorMessage +
	    (errorStack ? '\n' + errorStack : '')
	  );
	};

	var createGetDataElementValue = function (
	  moduleProvider,
	  getDataElementDefinition,
	  replaceTokens,
	  undefinedVarsReturnEmpty,
	  settingsFileTransformer
	) {
	  return function (name, syntheticEvent) {
	    var dataDef = getDataElementDefinition(name);

	    if (!dataDef) {
	      return undefinedVarsReturnEmpty ? '' : undefined;
	    }

	    var storageDuration = dataDef.storageDuration;
	    var moduleExports;
	    var moduleDefinition;

	    try {
	      moduleExports = moduleProvider.getModuleExports(dataDef.modulePath);
	      moduleDefinition = moduleProvider.getModuleDefinition(dataDef.modulePath);
	    } catch (e) {
	      logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
	      return;
	    }

	    if (typeof moduleExports !== 'function') {
	      logger.error(
	        getErrorMessage(dataDef, name, 'Module did not export a function.')
	      );
	      return;
	    }

	    var value;

	    var dataElementSettings = dataDef.settings || {};
	    if (!dataDef.hasTransformedFilePaths && moduleDefinition.filePaths) {
	      settingsFileTransformer(
	        dataElementSettings,
	        moduleDefinition.filePaths,
	        dataDef.modulePath
	      );
	      dataDef.hasTransformedFilePaths = true;
	    }

	    try {
	      value = moduleExports(
	        replaceTokens(dataElementSettings, syntheticEvent),
	        syntheticEvent
	      );
	    } catch (e) {
	      logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
	      return;
	    }

	    if (storageDuration) {
	      if (value != null) {
	        dataElementSafe.setValue(name, storageDuration, value);
	      } else {
	        value = dataElementSafe.getValue(name, storageDuration);
	      }
	    }

	    if (value == null && dataDef.defaultValue != null) {
	      value = dataDef.defaultValue;
	    }

	    if (typeof value === 'string') {
	      if (dataDef.cleanText) {
	        value = cleanText(value);
	      }

	      if (dataDef.forceLowerCase) {
	        value = value.toLowerCase();
	      }
	    }

	    return value;
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var specialPropertyAccessors = {
	  text: function (obj) {
	    return obj.textContent;
	  },
	  cleanText: function (obj) {
	    return cleanText(obj.textContent);
	  }
	};

	/**
	 * This returns the value of a property at a given path. For example, a <code>path<code> of
	 * <code>foo.bar</code> will return the value of <code>obj.foo.bar</code>.
	 *
	 * In addition, if <code>path</code> is <code>foo.bar.getAttribute(unicorn)</code> and
	 * <code>obj.foo.bar</code> has a method named <code>getAttribute</code>, the method will be
	 * called with a value of <code>"unicorn"</code> and the value will be returned.
	 *
	 * Also, if <code>path</code> is <code>foo.bar.@text</code> or other supported properties
	 * beginning with <code>@</code>, a special accessor will be used.
	 *
	 * @param host
	 * @param path
	 * @param supportSpecial
	 * @returns {*}
	 */
	var getObjectProperty = function (host, propChain, supportSpecial) {
	  var value = host;
	  var attrMatch;
	  for (var i = 0, len = propChain.length; i < len; i++) {
	    if (value == null) {
	      return undefined;
	    }
	    var prop = propChain[i];
	    if (supportSpecial && prop.charAt(0) === '@') {
	      var specialProp = prop.slice(1);
	      value = specialPropertyAccessors[specialProp](value);
	      continue;
	    }
	    if (
	      value.getAttribute &&
	      (attrMatch = prop.match(/^getAttribute\((.+)\)$/))
	    ) {
	      var attr = attrMatch[1];
	      value = value.getAttribute(attr);
	      continue;
	    }
	    value = value[prop];
	  }
	  return value;
	};

	/**
	 * Returns the value of a variable.
	 * @param {string} variable
	 * @param {Object} [syntheticEvent] A synthetic event. Only required when using %event... %this...
	 * or %target...
	 * @returns {*}
	 */
	var createGetVar = function (
	  customVars,
	  getDataElementDefinition,
	  getDataElementValue
	) {
	  return function (variable, syntheticEvent) {
	    var value;

	    if (getDataElementDefinition(variable)) {
	      // Accessing nested properties of a data element using dot-notation is unsupported because
	      // users can currently create data elements with periods in the name.
	      value = getDataElementValue(variable, syntheticEvent);
	    } else {
	      var propChain = variable.split('.');
	      var variableHostName = propChain.shift();

	      if (variableHostName === 'this') {
	        if (syntheticEvent) {
	          // I don't know why this is the only one that supports special properties, but that's the
	          // way it was in Satellite.
	          value = getObjectProperty(syntheticEvent.element, propChain, true);
	        }
	      } else if (variableHostName === 'event') {
	        if (syntheticEvent) {
	          value = getObjectProperty(syntheticEvent, propChain);
	        }
	      } else if (variableHostName === 'target') {
	        if (syntheticEvent) {
	          value = getObjectProperty(syntheticEvent.target, propChain);
	        }
	      } else {
	        value = getObjectProperty(customVars[variableHostName], propChain);
	      }
	    }

	    return value;
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Determines if the provided name is a valid variable, where the variable
	 * can be a data element, element, event, target, or custom var.
	 * @param variableName
	 * @returns {boolean}
	 */
	var createIsVar = function (customVars, getDataElementDefinition) {
	  return function (variableName) {
	    var nameBeforeDot = variableName.split('.')[0];

	    return Boolean(
	      getDataElementDefinition(variableName) ||
	        nameBeforeDot === 'this' ||
	        nameBeforeDot === 'event' ||
	        nameBeforeDot === 'target' ||
	        customVars.hasOwnProperty(nameBeforeDot)
	    );
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	var extractModuleExports = function (script, require, turbine) {
	  var module = {
	    exports: {}
	  };

	  script.call(module.exports, module, module.exports, require, turbine);

	  return module.exports;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var createModuleProvider = function () {
	  var moduleByReferencePath = {};

	  var getModule = function (referencePath) {
	    var module = moduleByReferencePath[referencePath];

	    if (!module) {
	      throw new Error('Module ' + referencePath + ' not found.');
	    }

	    return module;
	  };

	  var registerModule = function (
	    referencePath,
	    moduleDefinition,
	    extensionName,
	    require,
	    turbine
	  ) {
	    var module = {
	      definition: moduleDefinition,
	      extensionName: extensionName,
	      require: require,
	      turbine: turbine
	    };
	    module.require = require;
	    moduleByReferencePath[referencePath] = module;
	  };

	  var hydrateCache = function () {
	    Object.keys(moduleByReferencePath).forEach(function (referencePath) {
	      try {
	        getModuleExports(referencePath);
	      } catch (e) {
	        var errorMessage =
	          'Error initializing module ' +
	          referencePath +
	          '. ' +
	          e.message +
	          (e.stack ? '\n' + e.stack : '');
	        logger.error(errorMessage);
	      }
	    });
	  };

	  var getModuleExports = function (referencePath) {
	    var module = getModule(referencePath);

	    // Using hasOwnProperty instead of a falsey check because the module could export undefined
	    // in which case we don't want to execute the module each time the exports is requested.
	    if (!module.hasOwnProperty('exports')) {
	      module.exports = extractModuleExports(
	        module.definition.script,
	        module.require,
	        module.turbine
	      );
	    }

	    return module.exports;
	  };

	  var getModuleDefinition = function (referencePath) {
	    return getModule(referencePath).definition;
	  };

	  var getModuleExtensionName = function (referencePath) {
	    return getModule(referencePath).extensionName;
	  };

	  return {
	    registerModule: registerModule,
	    hydrateCache: hydrateCache,
	    getModuleExports: getModuleExports,
	    getModuleDefinition: getModuleDefinition,
	    getModuleExtensionName: getModuleExtensionName
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var warningLogged = false;

	var createNotifyMonitors = function (_satellite) {
	  return function (type, event) {
	    var monitors = _satellite._monitors;

	    if (monitors) {
	      if (!warningLogged) {
	        logger.warn(
	          'The _satellite._monitors API may change at any time and should only ' +
	            'be used for debugging.'
	        );
	        warningLogged = true;
	      }

	      monitors.forEach(function (monitor) {
	        if (monitor[type]) {
	          monitor[type](event);
	        }
	      });
	    }
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	/**
	 * Replacing any variable tokens (%myDataElement%, %this.foo%, etc.) with their associated values.
	 * A new string, object, or array will be created; the thing being processed will never be
	 * modified.
	 * @param {*} thing Thing potentially containing variable tokens. Objects and arrays will be
	 * deeply processed.
	 * @param {HTMLElement} [element] Associated HTML element. Used for special tokens
	 * (%this.something%).
	 * @param {Object} [event] Associated event. Used for special tokens (%event.something%,
	 * %target.something%)
	 * @returns {*} A processed value.
	 */
	var createReplaceTokens = function (isVar, getVar, undefinedVarsReturnEmpty) {
	  var replaceTokensInString;
	  var replaceTokensInObject;
	  var replaceTokensInArray;
	  var replaceTokens;
	  var variablesBeingRetrieved = [];

	  var getVarValue = function (token, variableName, syntheticEvent) {
	    if (!isVar(variableName)) {
	      return token;
	    }

	    variablesBeingRetrieved.push(variableName);
	    var val = getVar(variableName, syntheticEvent);
	    variablesBeingRetrieved.pop();
	    return val == null && undefinedVarsReturnEmpty ? '' : val;
	  };

	  /**
	   * Perform variable substitutions to a string where tokens are specified in the form %foo%.
	   * If the only content of the string is a single data element token, then the raw data element
	   * value will be returned instead.
	   *
	   * @param str {string} The string potentially containing data element tokens.
	   * @param element {HTMLElement} The element to use for tokens in the form of %this.property%.
	   * @param event {Object} The event object to use for tokens in the form of %target.property%.
	   * @returns {*}
	   */
	  replaceTokensInString = function (str, syntheticEvent) {
	    // Is the string a single data element token and nothing else?
	    var result = /^%([^%]+)%$/.exec(str);

	    if (result) {
	      return getVarValue(str, result[1], syntheticEvent);
	    } else {
	      return str.replace(/%(.+?)%/g, function (token, variableName) {
	        return getVarValue(token, variableName, syntheticEvent);
	      });
	    }
	  };

	  replaceTokensInObject = function (obj, syntheticEvent) {
	    var ret = {};
	    var keys = Object.keys(obj);
	    for (var i = 0; i < keys.length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      ret[key] = replaceTokens(value, syntheticEvent);
	    }
	    return ret;
	  };

	  replaceTokensInArray = function (arr, syntheticEvent) {
	    var ret = [];
	    for (var i = 0, len = arr.length; i < len; i++) {
	      ret.push(replaceTokens(arr[i], syntheticEvent));
	    }
	    return ret;
	  };

	  replaceTokens = function (thing, syntheticEvent) {
	    if (typeof thing === 'string') {
	      return replaceTokensInString(thing, syntheticEvent);
	    } else if (Array.isArray(thing)) {
	      return replaceTokensInArray(thing, syntheticEvent);
	    } else if (typeof thing === 'object' && thing !== null) {
	      return replaceTokensInObject(thing, syntheticEvent);
	    }

	    return thing;
	  };

	  return function (thing, syntheticEvent) {
	    // It's possible for a data element to reference another data element. Because of this,
	    // we need to prevent circular dependencies from causing an infinite loop.
	    if (variablesBeingRetrieved.length > 10) {
	      logger.error(
	        'Data element circular reference detected: ' +
	          variablesBeingRetrieved.join(' -> ')
	      );
	      return thing;
	    }

	    return replaceTokens(thing, syntheticEvent);
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	var createSetCustomVar = function (customVars) {
	  return function () {
	    if (typeof arguments[0] === 'string') {
	      customVars[arguments[0]] = arguments[1];
	    } else if (arguments[0]) {
	      // assume an object literal
	      var mapping = arguments[0];
	      for (var key in mapping) {
	        customVars[key] = mapping[key];
	      }
	    }
	  };
	};

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	function createCommonjsModule(fn) {
	  var module = { exports: {} };
		return fn(module, module.exports), module.exports;
	}

	/**
	 * @this {Promise}
	 */
	function finallyConstructor(callback) {
	  var constructor = this.constructor;
	  return this.then(
	    function(value) {
	      // @ts-ignore
	      return constructor.resolve(callback()).then(function() {
	        return value;
	      });
	    },
	    function(reason) {
	      // @ts-ignore
	      return constructor.resolve(callback()).then(function() {
	        // @ts-ignore
	        return constructor.reject(reason);
	      });
	    }
	  );
	}

	// Store setTimeout reference so promise-polyfill will be unaffected by
	// other code modifying setTimeout (like sinon.useFakeTimers())
	var setTimeoutFunc = setTimeout;

	function isArray(x) {
	  return Boolean(x && typeof x.length !== 'undefined');
	}

	function noop() {}

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
	  return function() {
	    fn.apply(thisArg, arguments);
	  };
	}

	/**
	 * @constructor
	 * @param {Function} fn
	 */
	function Promise$1(fn) {
	  if (!(this instanceof Promise$1))
	    throw new TypeError('Promises must be constructed via new');
	  if (typeof fn !== 'function') throw new TypeError('not a function');
	  /** @type {!number} */
	  this._state = 0;
	  /** @type {!boolean} */
	  this._handled = false;
	  /** @type {Promise|undefined} */
	  this._value = undefined;
	  /** @type {!Array<!Function>} */
	  this._deferreds = [];

	  doResolve(fn, this);
	}

	function handle(self, deferred) {
	  while (self._state === 3) {
	    self = self._value;
	  }
	  if (self._state === 0) {
	    self._deferreds.push(deferred);
	    return;
	  }
	  self._handled = true;
	  Promise$1._immediateFn(function() {
	    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
	    if (cb === null) {
	      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
	      return;
	    }
	    var ret;
	    try {
	      ret = cb(self._value);
	    } catch (e) {
	      reject(deferred.promise, e);
	      return;
	    }
	    resolve(deferred.promise, ret);
	  });
	}

	function resolve(self, newValue) {
	  try {
	    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	    if (newValue === self)
	      throw new TypeError('A promise cannot be resolved with itself.');
	    if (
	      newValue &&
	      (typeof newValue === 'object' || typeof newValue === 'function')
	    ) {
	      var then = newValue.then;
	      if (newValue instanceof Promise$1) {
	        self._state = 3;
	        self._value = newValue;
	        finale(self);
	        return;
	      } else if (typeof then === 'function') {
	        doResolve(bind(then, newValue), self);
	        return;
	      }
	    }
	    self._state = 1;
	    self._value = newValue;
	    finale(self);
	  } catch (e) {
	    reject(self, e);
	  }
	}

	function reject(self, newValue) {
	  self._state = 2;
	  self._value = newValue;
	  finale(self);
	}

	function finale(self) {
	  if (self._state === 2 && self._deferreds.length === 0) {
	    Promise$1._immediateFn(function() {
	      if (!self._handled) {
	        Promise$1._unhandledRejectionFn(self._value);
	      }
	    });
	  }

	  for (var i = 0, len = self._deferreds.length; i < len; i++) {
	    handle(self, self._deferreds[i]);
	  }
	  self._deferreds = null;
	}

	/**
	 * @constructor
	 */
	function Handler(onFulfilled, onRejected, promise) {
	  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	  this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, self) {
	  var done = false;
	  try {
	    fn(
	      function(value) {
	        if (done) return;
	        done = true;
	        resolve(self, value);
	      },
	      function(reason) {
	        if (done) return;
	        done = true;
	        reject(self, reason);
	      }
	    );
	  } catch (ex) {
	    if (done) return;
	    done = true;
	    reject(self, ex);
	  }
	}

	Promise$1.prototype['catch'] = function(onRejected) {
	  return this.then(null, onRejected);
	};

	Promise$1.prototype.then = function(onFulfilled, onRejected) {
	  // @ts-ignore
	  var prom = new this.constructor(noop);

	  handle(this, new Handler(onFulfilled, onRejected, prom));
	  return prom;
	};

	Promise$1.prototype['finally'] = finallyConstructor;

	Promise$1.all = function(arr) {
	  return new Promise$1(function(resolve, reject) {
	    if (!isArray(arr)) {
	      return reject(new TypeError('Promise.all accepts an array'));
	    }

	    var args = Array.prototype.slice.call(arr);
	    if (args.length === 0) return resolve([]);
	    var remaining = args.length;

	    function res(i, val) {
	      try {
	        if (val && (typeof val === 'object' || typeof val === 'function')) {
	          var then = val.then;
	          if (typeof then === 'function') {
	            then.call(
	              val,
	              function(val) {
	                res(i, val);
	              },
	              reject
	            );
	            return;
	          }
	        }
	        args[i] = val;
	        if (--remaining === 0) {
	          resolve(args);
	        }
	      } catch (ex) {
	        reject(ex);
	      }
	    }

	    for (var i = 0; i < args.length; i++) {
	      res(i, args[i]);
	    }
	  });
	};

	Promise$1.resolve = function(value) {
	  if (value && typeof value === 'object' && value.constructor === Promise$1) {
	    return value;
	  }

	  return new Promise$1(function(resolve) {
	    resolve(value);
	  });
	};

	Promise$1.reject = function(value) {
	  return new Promise$1(function(resolve, reject) {
	    reject(value);
	  });
	};

	Promise$1.race = function(arr) {
	  return new Promise$1(function(resolve, reject) {
	    if (!isArray(arr)) {
	      return reject(new TypeError('Promise.race accepts an array'));
	    }

	    for (var i = 0, len = arr.length; i < len; i++) {
	      Promise$1.resolve(arr[i]).then(resolve, reject);
	    }
	  });
	};

	// Use polyfill for setImmediate for performance gains
	Promise$1._immediateFn =
	  // @ts-ignore
	  (typeof setImmediate === 'function' &&
	    function(fn) {
	      // @ts-ignore
	      setImmediate(fn);
	    }) ||
	  function(fn) {
	    setTimeoutFunc(fn, 0);
	  };

	Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
	  if (typeof console !== 'undefined' && console) {
	    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
	  }
	};

	var src$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': Promise$1
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(src$1);

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	// For building Turbine we are using Rollup. For running the turbine tests we are using
	// Karma + Webpack. You need to specify the default import when using promise-polyfill`
	// with Webpack 2+. We need `require('promise-polyfill').default` for running the tests
	// and `require('promise-polyfill')` for building Turbine.
	var reactorPromise =
	  (typeof window !== 'undefined' && window.Promise) ||
	  (typeof commonjsGlobal !== 'undefined' && commonjsGlobal.Promise) ||
	  require$$0.default ||
	  require$$0;

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/

	var createAddActionToQueue = function (
	  executeDelegateModule,
	  normalizeRuleComponentError,
	  logActionError
	) {
	  return function (action, rule, syntheticEvent, lastPromiseInQueue) {
	    return lastPromiseInQueue.then(function () {
	      // This module is used when ruleComponentSequencing is enabled.
	      // action.timeout is always supplied to this module as >= 0 when delayNext is true.

	      var delayNextAction = action.delayNext;
	      var actionTimeoutId;

	      return new reactorPromise(function (resolve, reject) {
	        var moduleResult = executeDelegateModule(action, syntheticEvent, [
	          syntheticEvent
	        ]);

	        if (!delayNextAction) {
	          return resolve();
	        }

	        var promiseTimeoutMs = action.timeout;
	        var timeoutPromise = new reactorPromise(function (resolve, reject) {
	          actionTimeoutId = setTimeout(function () {
	            reject(
	              new Error(
	                'A timeout occurred because the action took longer than ' +
	                  promiseTimeoutMs / 1000 +
	                  ' seconds to complete. '
	              )
	            );
	          }, promiseTimeoutMs);
	        });

	        reactorPromise.race([moduleResult, timeoutPromise]).then(resolve, reject);
	      })
	        .catch(function (e) {
	          clearTimeout(actionTimeoutId);
	          e = normalizeRuleComponentError(e);
	          logActionError(action, rule, e);
	          return reactorPromise.reject(e);
	        })
	        .then(function () {
	          clearTimeout(actionTimeoutId);
	        });
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/

	var createAddConditionToQueue = function (
	  executeDelegateModule,
	  normalizeRuleComponentError,
	  isConditionMet,
	  logConditionError,
	  logConditionNotMet
	) {
	  return function (condition, rule, syntheticEvent, lastPromiseInQueue) {
	    return lastPromiseInQueue.then(function () {
	      // This module is used when ruleComponentSequencing is enabled.
	      // condition.timeout is always supplied to this module as >= 0.
	      // Conditions always assume delayNext = true because we have to know the
	      // condition result before moving on.
	      var conditionTimeoutId;

	      return new reactorPromise(function (resolve, reject) {
	        var moduleResult = executeDelegateModule(condition, syntheticEvent, [
	          syntheticEvent
	        ]);

	        var promiseTimeoutMs = condition.timeout;
	        var timeoutPromise = new reactorPromise(function (resolve, reject) {
	          conditionTimeoutId = setTimeout(function () {
	            reject(
	              new Error(
	                'A timeout occurred because the condition took longer than ' +
	                  promiseTimeoutMs / 1000 +
	                  ' seconds to complete. '
	              )
	            );
	          }, promiseTimeoutMs);
	        });

	        reactorPromise.race([moduleResult, timeoutPromise]).then(resolve, reject);
	      })
	        .catch(function (e) {
	          clearTimeout(conditionTimeoutId);
	          e = normalizeRuleComponentError(e);
	          logConditionError(condition, rule, e);
	          return reactorPromise.reject(e);
	        })
	        .then(function (result) {
	          clearTimeout(conditionTimeoutId);
	          if (!isConditionMet(condition, result)) {
	            logConditionNotMet(condition, rule);
	            return reactorPromise.reject();
	          }
	        });
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/

	var lastPromiseInQueue = reactorPromise.resolve();

	var createAddRuleToQueue = function (
	  addConditionToQueue,
	  addActionToQueue,
	  logRuleCompleted
	) {
	  return function (rule, syntheticEvent) {
	    if (rule.conditions) {
	      rule.conditions.forEach(function (condition) {
	        lastPromiseInQueue = addConditionToQueue(
	          condition,
	          rule,
	          syntheticEvent,
	          lastPromiseInQueue
	        );
	      });
	    }

	    if (rule.actions) {
	      rule.actions.forEach(function (action) {
	        lastPromiseInQueue = addActionToQueue(
	          action,
	          rule,
	          syntheticEvent,
	          lastPromiseInQueue
	        );
	      });
	    }

	    lastPromiseInQueue = lastPromiseInQueue.then(function () {
	      logRuleCompleted(rule);
	    });

	    // Allows later rules to keep running when an error occurs within this rule.
	    lastPromiseInQueue = lastPromiseInQueue.catch(function () {});

	    return lastPromiseInQueue;
	  };
	};

	var isPromiseLike = function (value) {
	  return Boolean(
	    value && typeof value === 'object' && typeof value.then === 'function'
	  );
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/

	var createEvaluateConditions = function (
	  executeDelegateModule,
	  isConditionMet,
	  logConditionNotMet,
	  logConditionError
	) {
	  return function (rule, syntheticEvent) {
	    var condition;

	    if (rule.conditions) {
	      for (var i = 0; i < rule.conditions.length; i++) {
	        condition = rule.conditions[i];

	        try {
	          var result = executeDelegateModule(condition, syntheticEvent, [
	            syntheticEvent
	          ]);

	          // If the result is promise-like, the extension needs to do something asynchronously,
	          // but the customer does not have rule component sequencing enabled on the property.
	          // If we didn't do this, the condition would always pass because the promise is
	          // considered "truthy".
	          if (isPromiseLike(result)) {
	            throw new Error(
	              'Rule component sequencing must be enabled on the property ' +
	                'for this condition to function properly.'
	            );
	          }

	          if (!isConditionMet(condition, result)) {
	            logConditionNotMet(condition, rule);
	            return false;
	          }
	        } catch (e) {
	          logConditionError(condition, rule, e);
	          return false;
	        }
	      }
	    }

	    return true;
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createExecuteRule = function (evaluateConditions, runActions) {
	  return function (rule, normalizedSyntheticEvent) {
	    if (evaluateConditions(rule, normalizedSyntheticEvent)) {
	      runActions(rule, normalizedSyntheticEvent);
	    }
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createGetModuleDisplayNameByRuleComponent = function (moduleProvider) {
	  return function (ruleComponent) {
	    var moduleDefinition = moduleProvider.getModuleDefinition(
	      ruleComponent.modulePath
	    );
	    return (
	      (moduleDefinition && moduleDefinition.displayName) ||
	      ruleComponent.modulePath
	    );
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createGetSyntheticEventMeta = function (moduleProvider) {
	  return function (ruleEventPair) {
	    var rule = ruleEventPair.rule;
	    var event = ruleEventPair.event;

	    var moduleName = moduleProvider.getModuleDefinition(event.modulePath).name;
	    var extensionName = moduleProvider.getModuleExtensionName(event.modulePath);

	    return {
	      $type: extensionName + '.' + moduleName,
	      $rule: {
	        id: rule.id,
	        name: rule.name
	      }
	    };
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createInitEventModule = function (
	  triggerRule,
	  executeDelegateModule,
	  normalizeSyntheticEvent,
	  getErrorMessage,
	  getSyntheticEventMeta,
	  logger
	) {
	  return function (guardUntilAllInitialized, ruleEventPair) {
	    var rule = ruleEventPair.rule;
	    var event = ruleEventPair.event;
	    event.settings = event.settings || {};

	    try {
	      var syntheticEventMeta = getSyntheticEventMeta(ruleEventPair);

	      executeDelegateModule(event, null, [
	        /**
	         * This is the callback that executes a particular rule when an event has occurred.
	         * @param {Object} [syntheticEvent] An object that contains detail regarding the event
	         * that occurred.
	         */
	        function trigger(syntheticEvent) {
	          // DTM-11871
	          // If we're still in the process of initializing event modules,
	          // we need to queue up any calls to trigger, otherwise if the triggered
	          // rule does something that triggers a different rule whose event module
	          // has not been initialized, that secondary rule will never get executed.
	          // This can be removed if we decide to always use the rule queue, since
	          // conditions and actions will be processed asynchronously, which
	          // would give time for all event modules to be initialized.

	          var normalizedSyntheticEvent = normalizeSyntheticEvent(
	            syntheticEventMeta,
	            syntheticEvent
	          );

	          guardUntilAllInitialized(function () {
	            triggerRule(normalizedSyntheticEvent, rule);
	          });
	        }
	      ]);
	    } catch (e) {
	      logger.error(getErrorMessage(event, rule, e));
	    }
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createLogActionError = function (
	  getRuleComponentErrorMessage,
	  getModuleDisplayNameByRuleComponent,
	  logger,
	  notifyMonitors
	) {
	  return function (action, rule, e) {
	    var actionDisplayName = getModuleDisplayNameByRuleComponent(action);

	    logger.error(getRuleComponentErrorMessage(actionDisplayName, rule.name, e));

	    notifyMonitors('ruleActionFailed', {
	      rule: rule,
	      action: action
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createLogConditionError = function (
	  getRuleComponentErrorMessage,
	  getModuleDisplayNameByRuleComponent,
	  logger,
	  notifyMonitors
	) {
	  return function (condition, rule, e) {
	    var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

	    logger.error(
	      getRuleComponentErrorMessage(conditionDisplayName, rule.name, e)
	    );

	    notifyMonitors('ruleConditionFailed', {
	      rule: rule,
	      condition: condition
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createLogConditionNotMet = function (
	  getModuleDisplayNameByRuleComponent,
	  logger,
	  notifyMonitors
	) {
	  return function (condition, rule) {
	    var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

	    logger.log(
	      'Condition "' +
	        conditionDisplayName +
	        '" for rule "' +
	        rule.name +
	        '" was not met.'
	    );

	    notifyMonitors('ruleConditionFailed', {
	      rule: rule,
	      condition: condition
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createLogRuleCompleted = function (logger, notifyMonitors) {
	  return function (rule) {
	    logger.log('Rule "' + rule.name + '" fired.');
	    notifyMonitors('ruleCompleted', {
	      rule: rule
	    });
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createRunActions = function (
	  executeDelegateModule,
	  logActionError,
	  logRuleCompleted
	) {
	  return function (rule, syntheticEvent) {
	    var action;

	    if (rule.actions) {
	      for (var i = 0; i < rule.actions.length; i++) {
	        action = rule.actions[i];
	        try {
	          executeDelegateModule(action, syntheticEvent, [syntheticEvent]);
	        } catch (e) {
	          logActionError(action, rule, e);
	          return;
	        }
	      }
	    }

	    logRuleCompleted(rule);
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var createTriggerRule = function (
	  ruleComponentSequencingEnabled,
	  executeRule,
	  addRuleToQueue,
	  notifyMonitors
	) {
	  return function (normalizedSyntheticEvent, rule) {
	    notifyMonitors('ruleTriggered', {
	      rule: rule
	    });

	    if (ruleComponentSequencingEnabled) {
	      addRuleToQueue(rule, normalizedSyntheticEvent);
	    } else {
	      executeRule(rule, normalizedSyntheticEvent);
	    }
	  };
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var getRuleComponentErrorMessage = function (ruleComponentName, ruleName, error) {
	  return (
	    'Failed to execute "' +
	    ruleComponentName +
	    '" for "' +
	    ruleName +
	    '" rule. ' +
	    error.message +
	    (error.stack ? '\n' + error.stack : '')
	  );
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var isConditionMet = function (condition, result) {
	  return (result && !condition.negate) || (!result && condition.negate);
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var triggerCallQueue = [];
	var eventModulesInitialized = false;

	var guardUntilAllInitialized = function (callback) {
	  if (!eventModulesInitialized) {
	    triggerCallQueue.push(callback);
	  } else {
	    callback();
	  }
	};

	var initRules = function (buildRuleExecutionOrder, rules, initEventModule) {
	  buildRuleExecutionOrder(rules).forEach(function (ruleEventPair) {
	    initEventModule(guardUntilAllInitialized, ruleEventPair);
	  });

	  eventModulesInitialized = true;
	  triggerCallQueue.forEach(function (triggerCall) {
	    triggerCall();
	  });

	  triggerCallQueue = [];
	};

	/*
	Copyright 2020 Adobe. All rights reserved.
	This file is licensed to you under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License. You may obtain a copy
	of the License at http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software distributed under
	the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	OF ANY KIND, either express or implied. See the License for the specific language
	governing permissions and limitations under the License.
	*/
	var normalizeRuleComponentError = function (e) {
	  if (!e) {
	    e = new Error(
	      'The extension triggered an error, but no error information was provided.'
	    );
	  }

	  if (!(e instanceof Error)) {
	    var stringifiedError =
	      typeof e === 'object' ? JSON.stringify(e) : String(e);
	    e = new Error(stringifiedError);
	  }

	  return e;
	};

	/*!
	 * isobject <https://github.com/jonschlinkert/isobject>
	 *
	 * Copyright (c) 2014-2017, Jon Schlinkert.
	 * Released under the MIT License.
	 */

	var isobject = function isObject(val) {
	  return val != null && typeof val === 'object' && Array.isArray(val) === false;
	};

	/*!
	 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
	 *
	 * Copyright (c) 2014-2017, Jon Schlinkert.
	 * Released under the MIT License.
	 */



	function isObjectObject(o) {
	  return isobject(o) === true
	    && Object.prototype.toString.call(o) === '[object Object]';
	}

	var isPlainObject = function isPlainObject(o) {
	  var ctor,prot;

	  if (isObjectObject(o) === false) return false;

	  // If has modified constructor
	  ctor = o.constructor;
	  if (typeof ctor !== 'function') return false;

	  // If has modified prototype
	  prot = ctor.prototype;
	  if (isObjectObject(prot) === false) return false;

	  // If constructor does not have an Object-specific method
	  if (prot.hasOwnProperty('isPrototypeOf') === false) {
	    return false;
	  }

	  // Most likely a plain Object
	  return true;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	/**
	 * Normalizes a synthetic event so that it exists and has at least meta.
	 * @param {Object} syntheticEventMeta
	 * @param {Object} [syntheticEvent]
	 * @returns {Object}
	 */
	var normalizeSyntheticEvent = function (syntheticEventMeta, syntheticEvent) {
	  syntheticEvent = syntheticEvent || {};

	  // This ensures that as the user hands us a synthetic event for multiple rules,
	  // we aren't overwriting a new meta into the same object reference.
	  if (isPlainObject(syntheticEvent)) {
	    syntheticEvent = reactorObjectAssign({}, syntheticEvent, syntheticEventMeta);
	  } else {
	    // When syntheticEvent is not an object, there's nothing we can guarantee
	    // about the ability to "copy". Leave it alone.
	    reactorObjectAssign(syntheticEvent, syntheticEventMeta);
	  }

	  // Remove after some arbitrary time period when we think users have had sufficient chance
	  // to move away from event.type
	  if (!syntheticEvent.hasOwnProperty('type')) {
	    Object.defineProperty(syntheticEvent, 'type', {
	      get: function () {
	        logger.deprecation(
	          'Accessing event.type in Adobe Launch has been deprecated and will be ' +
	            'removed soon. Please use event.$type instead.'
	        );
	        return syntheticEvent.$type;
	      }
	    });
	  }

	  return syntheticEvent;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Creates a function that, when called with an extension name and module name, will return the
	 * exports of the respective shared module.
	 *
	 * @param {Object} extensions
	 * @param {Object} moduleProvider
	 * @returns {Function}
	 */
	var createGetSharedModuleExports = function (extensions, moduleProvider) {
	  return function (extensionName, moduleName) {
	    var extension = extensions[extensionName];

	    if (extension) {
	      var modules = extension.modules;
	      if (modules) {
	        var referencePaths = Object.keys(modules);
	        for (var i = 0; i < referencePaths.length; i++) {
	          var referencePath = referencePaths[i];
	          var module = modules[referencePath];
	          if (module.shared && module.name === moduleName) {
	            return moduleProvider.getModuleExports(referencePath);
	          }
	        }
	      }
	    }
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Creates a function that, when called, will return a configuration object with data element
	 * tokens replaced.
	 *
	 * @param {Object} settings
	 * @returns {Function}
	 */
	var createGetExtensionSettings = function (replaceTokens, settings) {
	  return function () {
	    return settings ? replaceTokens(settings) : {};
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	/**
	 * Creates a function that, when called, will return the full hosted lib file URL.
	 *
	 * @param {string} hostedLibFilesBaseUrl
	 * @returns {Function}
	 */

	var createGetHostedLibFileUrl = function (
	  decorateWithDynamicHost,
	  hostedLibFilesBaseUrl,
	  minified
	) {
	  return function (file) {
	    if (minified) {
	      var fileParts = file.split('.');
	      fileParts.splice(fileParts.length - 1 || 1, 0, 'min');
	      file = fileParts.join('.');
	    }

	    return decorateWithDynamicHost(hostedLibFilesBaseUrl) + file;
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/
	var JS_EXTENSION = '.js';

	/**
	 * @private
	 * Returns the directory of a path. A limited version of path.dirname in nodejs.
	 *
	 * To keep it simple, it makes the following assumptions:
	 * path has a least one slash
	 * path does not end with a slash
	 * path does not have empty segments (e.g., /src/lib//foo.bar)
	 *
	 * @param {string} path
	 * @returns {string}
	 */
	var dirname = function (path) {
	  return path.substr(0, path.lastIndexOf('/'));
	};

	/**
	 * Determines if a string ends with a certain string.
	 * @param {string} str The string to test.
	 * @param {string} suffix The suffix to look for at the end of str.
	 * @returns {boolean} Whether str ends in suffix.
	 */
	var endsWith = function (str, suffix) {
	  return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	/**
	 * Given a starting path and a path relative to the starting path, returns the final path. A
	 * limited version of path.resolve in nodejs.
	 *
	 * To keep it simple, it makes the following assumptions:
	 * fromPath has at least one slash
	 * fromPath does not end with a slash.
	 * fromPath does not have empty segments (e.g., /src/lib//foo.bar)
	 * relativePath starts with ./ or ../
	 *
	 * @param {string} fromPath
	 * @param {string} relativePath
	 * @returns {string}
	 */
	var resolveRelativePath = function (fromPath, relativePath) {
	  // Handle the case where the relative path does not end in the .js extension. We auto-append it.
	  if (!endsWith(relativePath, JS_EXTENSION)) {
	    relativePath = relativePath + JS_EXTENSION;
	  }

	  var relativePathSegments = relativePath.split('/');
	  var resolvedPathSegments = dirname(fromPath).split('/');

	  relativePathSegments.forEach(function (relativePathSegment) {
	    if (!relativePathSegment || relativePathSegment === '.') {
	      return;
	    } else if (relativePathSegment === '..') {
	      if (resolvedPathSegments.length) {
	        resolvedPathSegments.pop();
	      }
	    } else {
	      resolvedPathSegments.push(relativePathSegment);
	    }
	  });

	  return resolvedPathSegments.join('/');
	};

	/*!
	 * JavaScript Cookie v2.2.1
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */

	var js_cookie = createCommonjsModule(function (module, exports) {
	(function (factory) {
		var registeredInModuleLoader;
		{
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function decode (s) {
			return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
		}

		function init (converter) {
			function api() {}

			function set (key, value, attributes) {
				if (typeof document === 'undefined') {
					return;
				}

				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					var result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = converter.write ?
					converter.write(value, key) :
					encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key))
					.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
					.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';
				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}

					// Considers RFC 6265 section 5.2:
					// ...
					// 3.  If the remaining unparsed-attributes contains a %x3B (";")
					//     character:
					// Consume the characters of the unparsed-attributes up to,
					// not including, the first %x3B (";") character.
					// ...
					stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
				}

				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			function get (key, json) {
				if (typeof document === 'undefined') {
					return;
				}

				var jar = {};
				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all.
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (!json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = decode(parts[0]);
						cookie = (converter.read || converter)(cookie, name) ||
							decode(cookie);

						if (json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						jar[name] = cookie;

						if (key === name) {
							break;
						}
					} catch (e) {}
				}

				return key ? jar[key] : jar;
			}

			api.set = set;
			api.get = function (key) {
				return get(key, false /* read as raw */);
			};
			api.getJSON = function (key) {
				return get(key, true /* read as json */);
			};
			api.remove = function (key, attributes) {
				set(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.defaults = {};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	}));
	});

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/



	// js-cookie has other methods that we haven't exposed here. By limiting the exposed API,
	// we have a little more flexibility to change the underlying implementation later. If clear
	// use cases come up for needing the other methods js-cookie exposes, we can re-evaluate whether
	// we want to expose them here.
	var reactorCookie = {
	  get: js_cookie.get,
	  set: js_cookie.set,
	  remove: js_cookie.remove
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/



	var getPromise = function(url, script) {
	  return new reactorPromise(function(resolve, reject) {
	    script.onload = function() {
	      resolve(script);
	    };

	    script.onerror = function() {
	      reject(new Error('Failed to load script ' + url));
	    };
	  });
	};

	var reactorLoadScript = function(url) {
	  var script = document.createElement('script');
	  script.src = url;
	  script.async = true;

	  var promise = getPromise(url, script);

	  document.getElementsByTagName('head')[0].appendChild(script);
	  return promise;
	};

	// Copyright Joyent, Inc. and other Node contributors.

	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	var decode = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};

	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }

	  var regexp = /\+/g;
	  qs = qs.split(sep);

	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }

	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }

	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;

	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }

	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);

	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }

	  return obj;
	};

	// Copyright Joyent, Inc. and other Node contributors.

	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	};

	var encode = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};

	var querystring = createCommonjsModule(function (module, exports) {

	exports.decode = exports.parse = decode;
	exports.encode = exports.stringify = encode;
	});

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/



	// We proxy the underlying querystring module so we can limit the API we expose.
	// This allows us to more easily make changes to the underlying implementation later without
	// having to worry about breaking extensions. If extensions demand additional functionality, we
	// can make adjustments as needed.
	var reactorQueryString = {
	  parse: function(string) {
	    //
	    if (typeof string === 'string') {
	      // Remove leading ?, #, & for some leniency so you can pass in location.search or
	      // location.hash directly.
	      string = string.trim().replace(/^[?#&]/, '');
	    }
	    return querystring.parse(string);
	  },
	  stringify: function(object) {
	    return querystring.stringify(object);
	  }
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var CORE_MODULE_PREFIX = '@adobe/reactor-';

	var modules = {
	  cookie: reactorCookie,
	  document: reactorDocument,
	  'load-script': reactorLoadScript,
	  'object-assign': reactorObjectAssign,
	  promise: reactorPromise,
	  'query-string': reactorQueryString,
	  window: reactorWindow
	};

	/**
	 * Creates a function which can be passed as a "require" function to extension modules.
	 *
	 * @param {Function} getModuleExportsByRelativePath
	 * @returns {Function}
	 */
	var createPublicRequire = function (getModuleExportsByRelativePath) {
	  return function (key) {
	    if (key.indexOf(CORE_MODULE_PREFIX) === 0) {
	      var keyWithoutScope = key.substr(CORE_MODULE_PREFIX.length);
	      var module = modules[keyWithoutScope];

	      if (module) {
	        return module;
	      }
	    }

	    if (key.indexOf('./') === 0 || key.indexOf('../') === 0) {
	      return getModuleExportsByRelativePath(key);
	    }

	    throw new Error('Cannot resolve module "' + key + '".');
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var hydrateModuleProvider = function (
	  container,
	  moduleProvider,
	  debugController,
	  replaceTokens,
	  getDataElementValue,
	  settingsFileTransformer,
	  decorateWithDynamicHost
	) {
	  var extensions = container.extensions;
	  var buildInfo = container.buildInfo;
	  var environment = container.environment;
	  var propertySettings = container.property.settings;

	  if (extensions) {
	    var getSharedModuleExports = createGetSharedModuleExports(
	      extensions,
	      moduleProvider
	    );

	    Object.keys(extensions).forEach(function (extensionName) {
	      var extension = extensions[extensionName];
	      var extensionSettings = extension.settings;
	      if (Array.isArray(extension.filePaths)) {
	        extensionSettings = settingsFileTransformer(
	          extensionSettings,
	          extension.filePaths
	        );
	      }
	      var getExtensionSettings = createGetExtensionSettings(
	        replaceTokens,
	        extensionSettings
	      );

	      if (extension.modules) {
	        var prefixedLogger = logger.createPrefixedLogger(extension.displayName);
	        var getHostedLibFileUrl = createGetHostedLibFileUrl(
	          decorateWithDynamicHost,
	          extension.hostedLibFilesBaseUrl,
	          buildInfo.minified
	        );
	        var turbine = {
	          buildInfo: buildInfo,
	          environment: environment,
	          property: {
	            name: container.property.name,
	            id: container.property.id
	          },
	          getDataElementValue: getDataElementValue,
	          getExtensionSettings: getExtensionSettings,
	          getHostedLibFileUrl: getHostedLibFileUrl,
	          getSharedModule: getSharedModuleExports,
	          logger: prefixedLogger,
	          propertySettings: propertySettings,
	          replaceTokens: replaceTokens,
	          onDebugChanged: debugController.onDebugChanged,
	          get debugEnabled() {
	            return debugController.getDebugEnabled();
	          }
	        };

	        Object.keys(extension.modules).forEach(function (referencePath) {
	          var module = extension.modules[referencePath];
	          var getModuleExportsByRelativePath = function (relativePath) {
	            var resolvedReferencePath = resolveRelativePath(
	              referencePath,
	              relativePath
	            );
	            return moduleProvider.getModuleExports(resolvedReferencePath);
	          };
	          var publicRequire = createPublicRequire(
	            getModuleExportsByRelativePath
	          );

	          moduleProvider.registerModule(
	            referencePath,
	            module,
	            extensionName,
	            publicRequire,
	            turbine
	          );
	        });
	      }
	    });

	    // We want to extract the module exports immediately to allow the modules
	    // to run some logic immediately.
	    // We need to do the extraction here in order for the moduleProvider to
	    // have all the modules previously registered. (eg. when moduleA needs moduleB, both modules
	    // must exist inside moduleProvider).
	    moduleProvider.hydrateCache();
	  }
	  return moduleProvider;
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	var hydrateSatelliteObject = function (
	  _satellite,
	  container,
	  setDebugEnabled,
	  getVar,
	  setCustomVar
	) {
	  var customScriptPrefixedLogger = logger.createPrefixedLogger('Custom Script');

	  // Will get replaced by the directCall event delegate from the Core extension. Exists here in
	  // case there are no direct call rules (and therefore the directCall event delegate won't get
	  // included) and our customers are still calling the method. In this case, we don't want an error
	  // to be thrown. This method existed before Reactor.
	  _satellite.track = function (identifier) {
	    logger.log(
	      '"' + identifier + '" does not match any direct call identifiers.'
	    );
	  };

	  // Will get replaced by the Marketing Cloud ID extension if installed. Exists here in case
	  // the extension is not installed and our customers are still calling the method. In this case,
	  // we don't want an error to be thrown. This method existed before Reactor.
	  _satellite.getVisitorId = function () {
	    return null;
	  };

	  // container.property also has property settings, but it shouldn't concern the user.
	  // By limiting our API exposure to necessities, we provide more flexibility in the future.
	  _satellite.property = {
	    name: container.property.name,
	    id: container.property.id
	  };

	  _satellite.company = container.company;

	  _satellite.buildInfo = container.buildInfo;

	  _satellite.environment = container.environment;

	  _satellite.logger = customScriptPrefixedLogger;

	  /**
	   * Log a message. We keep this due to legacy baggage.
	   * @param {string} message The message to log.
	   * @param {number} [level] A number that represents the level of logging.
	   * 3=info, 4=warn, 5=error, anything else=log
	   */
	  _satellite.notify = function (message, level) {
	    logger.deprecation(
	      '_satellite.notify is deprecated. Please use the `_satellite.logger` API.'
	    );

	    switch (level) {
	      case 3:
	        customScriptPrefixedLogger.info(message);
	        break;
	      case 4:
	        customScriptPrefixedLogger.warn(message);
	        break;
	      case 5:
	        customScriptPrefixedLogger.error(message);
	        break;
	      default:
	        customScriptPrefixedLogger.log(message);
	    }
	  };

	  _satellite.getVar = getVar;
	  _satellite.setVar = setCustomVar;

	  /**
	   * Writes a cookie.
	   * @param {string} name The name of the cookie to save.
	   * @param {string} value The value of the cookie to save.
	   * @param {number} [days] The number of days to store the cookie. If not specified, the cookie
	   * will be stored for the session only.
	   */
	  _satellite.setCookie = function (name, value, days) {
	    var optionsStr = '';
	    var options = {};

	    if (days) {
	      optionsStr = ', { expires: ' + days + ' }';
	      options.expires = days;
	    }

	    var msg =
	      '_satellite.setCookie is deprecated. Please use ' +
	      '_satellite.cookie.set("' +
	      name +
	      '", "' +
	      value +
	      '"' +
	      optionsStr +
	      ').';

	    logger.deprecation(msg);
	    reactorCookie.set(name, value, options);
	  };

	  /**
	   * Reads a cookie value.
	   * @param {string} name The name of the cookie to read.
	   * @returns {string}
	   */
	  _satellite.readCookie = function (name) {
	    logger.deprecation(
	      '_satellite.readCookie is deprecated. ' +
	        'Please use _satellite.cookie.get("' +
	        name +
	        '").'
	    );
	    return reactorCookie.get(name);
	  };

	  /**
	   * Removes a cookie value.
	   * @param name
	   */
	  _satellite.removeCookie = function (name) {
	    logger.deprecation(
	      '_satellite.removeCookie is deprecated. ' +
	        'Please use _satellite.cookie.remove("' +
	        name +
	        '").'
	    );
	    reactorCookie.remove(name);
	  };

	  _satellite.cookie = reactorCookie;

	  // Will get replaced by the pageBottom event delegate from the Core extension. Exists here in
	  // case the customers are not using core (and therefore the pageBottom event delegate won't get
	  // included) and they are still calling the method. In this case, we don't want an error
	  // to be thrown. This method existed before Reactor.
	  _satellite.pageBottom = function () {};

	  _satellite.setDebug = setDebugEnabled;

	  var warningLogged = false;

	  Object.defineProperty(_satellite, '_container', {
	    get: function () {
	      if (!warningLogged) {
	        logger.warn(
	          '_satellite._container may change at any time and should only ' +
	            'be used for debugging.'
	        );
	        warningLogged = true;
	      }

	      return container;
	    }
	  });
	};

	/***************************************************************************************
	 * (c) 2021 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	function isArrayReference(str) {
	  return (
	    typeof str === 'string' &&
	    str.indexOf('[') !== -1 &&
	    str.indexOf(']') !== -1
	  );
	}
	function sanitizeArrayKey(pathStrSegment) {
	  return pathStrSegment.substr(
	    0,
	    // the name goes up to the start of the array bracket: 'someArrayName[]'
	    pathStrSegment.indexOf('[')
	  );
	}

	/**
	 * Recursive function to loop through settings and look for the setting to transform,
	 * which is the final entry within the pathSegments array. Alters settings in-place.
	 * @param {Array} pathSegments
	 * @param {Object} settings
	 * @param {Function} decorateWithDynamicHost
	 */
	function traverseIntoSettings(pathSegments, settings, decorateWithDynamicHost) {
	  // nothing to do
	  if (!pathSegments.length || !isPlainObject(settings)) {
	    return;
	  }

	  var currentKey = pathSegments[0];

	  // base case
	  if (pathSegments.length === 1) {
	    if (
	      settings.hasOwnProperty(currentKey) &&
	      typeof settings[currentKey] === 'string'
	    ) {
	      settings[currentKey] = decorateWithDynamicHost(settings[currentKey]);
	    }
	    return;
	  }

	  // still more work to do
	  var remainingPathSegments = pathSegments.slice(1);
	  if (isArrayReference(currentKey)) {
	    // 'someArrayReference[]' --> 'someArrayReference'
	    currentKey = sanitizeArrayKey(currentKey);
	    var settingsValue = settings[currentKey];
	    if (Array.isArray(settingsValue)) {
	      settingsValue.forEach(function (arrayEntryObject) {
	        return traverseIntoSettings(
	          remainingPathSegments,
	          arrayEntryObject,
	          decorateWithDynamicHost
	        );
	      });
	    }
	  } else {
	    // object case
	    return traverseIntoSettings(
	      remainingPathSegments,
	      settings[currentKey],
	      decorateWithDynamicHost
	    );
	  }
	}

	/**
	 * Returns a function that when called will attempt to traverse the passed in
	 * settings object to each file path and transform a relative URL to an absolute
	 * URL.
	 *
	 * @param isDynamicEnforced
	 * @param decorateWithDynamicHost
	 * @returns {(function(*=, *=, *=): (*))|*}
	 */
	var createSettingsFileTransformer = function (isDynamicEnforced, decorateWithDynamicHost) {
	  return function (settings, filePaths, moduleReferencePath) {
	    if (
	      !isDynamicEnforced ||
	      !isPlainObject(settings) ||
	      !Object.keys(settings).length ||
	      !Array.isArray(filePaths) ||
	      !filePaths.length
	    ) {
	      return settings;
	    }

	    // pull out the file paths by the module's reference path and loop over each urlPath
	    filePaths.forEach(function (filePathString) {
	      // The custom code action provides the ability to have the source code in the 'source'
	      // variable or to have an external file. Therefore, this module has 2 behaviors.
	      // It also does not provide a value of false for isExternal just as all other extensions
	      // that use fileTransform do not provide an isExternal variable check. Therefore, we need
	      // to treat Adobe's custom code action special, and don't augment the 'source' variable
	      // if isExternal is not also present.
	      var isAdobeCustomCodeAction = Boolean(
	        moduleReferencePath != null &&
	          /^core\/.*actions.*\/customCode\.js$/.test(moduleReferencePath)
	      );
	      if (
	        isAdobeCustomCodeAction &&
	        filePathString === 'source' &&
	        !settings.isExternal
	      ) {
	        return;
	      }

	      // modify the object in place
	      traverseIntoSettings(
	        filePathString.split('.'),
	        settings,
	        decorateWithDynamicHost
	      );
	    });

	    return settings;
	  };
	};

	/***************************************************************************************
	 * (c) 2017 Adobe. All rights reserved.
	 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License. You may obtain a copy
	 * of the License at http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
	 * OF ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 ****************************************************************************************/

	// DYNAMIC URL













































	var _satellite = window._satellite;

	if (_satellite && !window.__satelliteLoaded) {
	  // If a consumer loads the library multiple times, make sure only the first time is effective.
	  window.__satelliteLoaded = true;

	  var container = _satellite.container;

	  // Remove container in public scope ASAP so it can't be manipulated by extension or user code.
	  delete _satellite.container;

	  /*
	    get rid of container.buildInfo decoration once deprecation is finished of
	    buildInfo.environment string
	   */
	  var buildInfo = reactorObjectAssign({}, container.buildInfo);
	  Object.defineProperty(buildInfo, 'environment', {
	    get: function () {
	      logger.deprecation(
	        'container.buildInfo.environment is deprecated.' +
	          'Please use `container.environment.stage` instead'
	      );
	      return container.environment.stage;
	    }
	  });
	  container.buildInfo = buildInfo;

	  var localStorage = getNamespacedStorage('localStorage');
	  var debugController = createDebugController(localStorage, logger);

	  var currentScriptSource = '';
	  if (reactorDocument.currentScript && reactorDocument.currentScript.getAttribute('src')) {
	    currentScriptSource = reactorDocument.currentScript.getAttribute('src');
	  }
	  var dynamicHostResolver;
	  try {
	    dynamicHostResolver = createDynamicHostResolver(
	      currentScriptSource,
	      Boolean(container.company.dynamicCdnEnabled),
	      container.company.cdnAllowList,
	      debugController
	    );
	  } catch (e) {
	    logger.warn('Please review the following error:');
	    throw e; // We don't want to continue allowing Turbine to start up if we detect an error in here
	  }

	  var settingsFileTransformer = createSettingsFileTransformer(
	    dynamicHostResolver.isDynamicEnforced,
	    dynamicHostResolver.decorateWithDynamicHost
	  );

	  var moduleProvider = createModuleProvider();

	  var replaceTokens;

	  var undefinedVarsReturnEmpty =
	    container.property.settings.undefinedVarsReturnEmpty;
	  var ruleComponentSequencingEnabled =
	    container.property.settings.ruleComponentSequencingEnabled;

	  var dataElements = container.dataElements || {};

	  var getDataElementDefinition = function (name) {
	    return dataElements[name];
	  };

	  // We support data elements referencing other data elements. In order to be able to retrieve a
	  // data element value, we need to be able to replace data element tokens inside its settings
	  // object (which is what replaceTokens is for). In order to be able to replace data element
	  // tokens inside a settings object, we need to be able to retrieve data element
	  // values (which is what getDataElementValue is for). This proxy replaceTokens function solves the
	  // chicken-or-the-egg problem by allowing us to provide a replaceTokens function to
	  // getDataElementValue that will stand in place of the real replaceTokens function until it
	  // can be created. This also means that createDataElementValue should not call the proxy
	  // replaceTokens function until after the real replaceTokens has been created.
	  var proxyReplaceTokens = function () {
	    return replaceTokens.apply(null, arguments);
	  };

	  var getDataElementValue = createGetDataElementValue(
	    moduleProvider,
	    getDataElementDefinition,
	    proxyReplaceTokens,
	    undefinedVarsReturnEmpty,
	    settingsFileTransformer
	  );

	  var customVars = {};
	  var setCustomVar = createSetCustomVar(customVars);

	  var isVar = createIsVar(customVars, getDataElementDefinition);

	  var getVar = createGetVar(
	    customVars,
	    getDataElementDefinition,
	    getDataElementValue
	  );

	  replaceTokens = createReplaceTokens(isVar, getVar, undefinedVarsReturnEmpty);

	  // Important to hydrate satellite object before we hydrate the module provider or init rules.
	  // When we hydrate module provider, we also execute extension code which may be
	  // accessing _satellite.
	  hydrateSatelliteObject(
	    _satellite,
	    container,
	    debugController.setDebugEnabled,
	    getVar,
	    setCustomVar
	  );

	  hydrateModuleProvider(
	    container,
	    moduleProvider,
	    debugController,
	    replaceTokens,
	    getDataElementValue,
	    settingsFileTransformer,
	    dynamicHostResolver.decorateWithDynamicHost
	  );

	  var notifyMonitors = createNotifyMonitors(_satellite);
	  var executeDelegateModule = createExecuteDelegateModule(
	    moduleProvider,
	    replaceTokens,
	    settingsFileTransformer
	  );

	  var getModuleDisplayNameByRuleComponent =
	    createGetModuleDisplayNameByRuleComponent(moduleProvider);
	  var logConditionNotMet = createLogConditionNotMet(
	    getModuleDisplayNameByRuleComponent,
	    logger,
	    notifyMonitors
	  );
	  var logConditionError = createLogConditionError(
	    getRuleComponentErrorMessage,
	    getModuleDisplayNameByRuleComponent,
	    logger,
	    notifyMonitors
	  );
	  var logActionError = createLogActionError(
	    getRuleComponentErrorMessage,
	    getModuleDisplayNameByRuleComponent,
	    logger,
	    notifyMonitors
	  );
	  var logRuleCompleted = createLogRuleCompleted(logger, notifyMonitors);

	  var evaluateConditions = createEvaluateConditions(
	    executeDelegateModule,
	    isConditionMet,
	    logConditionNotMet,
	    logConditionError
	  );
	  var runActions = createRunActions(
	    executeDelegateModule,
	    logActionError,
	    logRuleCompleted
	  );
	  var executeRule = createExecuteRule(evaluateConditions, runActions);

	  var addConditionToQueue = createAddConditionToQueue(
	    executeDelegateModule,
	    normalizeRuleComponentError,
	    isConditionMet,
	    logConditionError,
	    logConditionNotMet
	  );
	  var addActionToQueue = createAddActionToQueue(
	    executeDelegateModule,
	    normalizeRuleComponentError,
	    logActionError
	  );
	  var addRuleToQueue = createAddRuleToQueue(
	    addConditionToQueue,
	    addActionToQueue,
	    logRuleCompleted
	  );

	  var triggerRule = createTriggerRule(
	    ruleComponentSequencingEnabled,
	    executeRule,
	    addRuleToQueue,
	    notifyMonitors
	  );

	  var getSyntheticEventMeta = createGetSyntheticEventMeta(moduleProvider);

	  var initEventModule = createInitEventModule(
	    triggerRule,
	    executeDelegateModule,
	    normalizeSyntheticEvent,
	    getRuleComponentErrorMessage,
	    getSyntheticEventMeta,
	    logger
	  );

	  initRules(buildRuleExecutionOrder, container.rules || [], initEventModule);
	}

	// Rollup's iife option always sets a global with whatever is exported, so we'll set the
	// _satellite global with the same object it already is (we've only modified it).
	var src = _satellite;

	return src;

})();


