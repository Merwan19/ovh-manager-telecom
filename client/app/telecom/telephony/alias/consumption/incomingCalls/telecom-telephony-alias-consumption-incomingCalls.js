angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.consumptionIncomingCalls', {
    url: '/incomingCalls',
    views: {
      'aliasInnerView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/service/consumption/incomingCalls/telecom-telephony-service-consumption-incomingCalls.html',
        controller: 'TelecomTelephonyServiceConsumptionIncomingCallsCtrl',
        controllerAs: 'IncomingCallsCtrl',
      },
    },
    translations: ['..', '../../../service/consumption/', '../../../service/consumption/incomingCalls'],
  });
});
