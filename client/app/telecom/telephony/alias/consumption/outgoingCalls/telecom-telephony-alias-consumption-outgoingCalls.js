angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.consumptionOutgoingCalls', {
    url: '/outgoingCalls',
    views: {
      'aliasInnerView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/service/consumption/outgoingCalls/telecom-telephony-service-consumption-outgoingCalls.html',
        controller: 'TelecomTelephonyServiceConsumptionOutgoingCallsCtrl',
        controllerAs: 'OutgoingCallsCtrl',
      },
    },
    translations: ['..', '../../../service/consumption/', '../../../service/consumption/outgoingCalls'],
  });
});
