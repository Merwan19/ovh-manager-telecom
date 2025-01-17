angular.module('managerApp').config(/* @ngInject */ ($stateProvider) => {
  $stateProvider.state('telecom.pack.xdsl.modem.templates', {
    url: '/template',
    views: {
      'modemView@telecom.pack.xdsl.modem': {
        templateUrl: 'app/telecom/pack/xdsl/modem/templates/config/pack-xdsl-modem-templates-config.html',
        controller: 'XdslModemTemplateConfigCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.'],
    params: {
      templates: null,
    },
  });
});
