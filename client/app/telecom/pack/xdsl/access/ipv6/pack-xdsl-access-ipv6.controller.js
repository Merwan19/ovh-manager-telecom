angular.module('managerApp').controller('XdslAccessIpv6Ctrl', function ($stateParams, $scope, $translate, OvhApiXdslIps, TucToast, TucToastError) {
  this.submitIp = function () {
    if (_.isEmpty($stateParams.serviceName)) {
      TucToast.error($translate.instant('xdsl_access_ipv6_an_error_ocurred'));
    }

    OvhApiXdslIps.v6().setIpv6(
      { xdslId: $stateParams.serviceName },
      { enabled: $scope.access.xdsl.ipv6Enabled },
      (result) => {
        if (result.status === 'todo' || result.status === 'doing') {
          $scope.access.tasks.current[result.function] = true;
        }
        if ($scope.access.xdsl.ipv6Enabled) {
          TucToast.success($translate.instant('xdsl_access_ipv6_success_validation_on'));
        } else {
          TucToast.success($translate.instant('xdsl_access_ipv6_success_validation_off'));
        }
      },
      (err) => {
        $scope.access.xdsl.ipv6Enabled = !$scope.access.xdsl.ipv6Enabled;
        return new TucToastError(err, 'xdsl_access_ipv6_an_error_ocurred');
      },
    );
  };

  this.undo = function () {
    $scope.access.xdsl.ipv6Enabled = !$scope.access.xdsl.ipv6Enabled;
  };

  function init() {
    // if task in progress -> it means that ipv6Enabled is going to change
    if ($scope.access.tasks.current.routingIpv6) {
      $scope.access.xdsl.ipv6Enabled = !$scope.access.xdsl.ipv6Enabled;
    }
  }

  init();
});
