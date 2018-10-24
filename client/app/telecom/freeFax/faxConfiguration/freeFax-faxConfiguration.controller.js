angular.module('managerApp')
  .controller('FreeFaxConfigurationCtrl', function ($stateParams, $scope, $translate, OvhApiFreeFax, TucToastError, tucValidator) {
    const self = this;

    this.editMode = false;
    this.validator = tucValidator;
    this.showFreeFaxHeaderTips = false;
    this.passwordDisplay = '*****';
    const savedModelData = {};

    this.maxRequestsOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.qualityOptions = [
      {
        value: 'normal',
        label: $translate.instant('freefax_quality_normal'),
      },
      {
        value: 'high',
        label: $translate.instant('freefax_quality_high'),
      },
      {
        value: 'best',
        label: $translate.instant('freefax_quality_best'),
      },
    ];

    function saveFormData() {
      savedModelData.fromEmail = $scope.freeFax.fromEmail;
      savedModelData.faxQuality = $scope.freeFax.faxQuality;
      savedModelData.faxTagLine = $scope.freeFax.faxTagLine;
      savedModelData.faxMaxCall = $scope.freeFax.faxMaxCall;
      savedModelData.fromName = $scope.freeFax.fromName;
    }

    function restoreFormData() {
      $scope.freeFax.fromEmail = savedModelData.fromEmail;
      $scope.freeFax.faxQuality = savedModelData.faxQuality;
      $scope.freeFax.faxTagLine = savedModelData.faxTagLine;
      $scope.freeFax.faxMaxCall = savedModelData.faxMaxCall;
      $scope.freeFax.fromName = savedModelData.fromName;
    }

    this.cancelEditMode = function () {
      restoreFormData();
      self.editMode = false;
    };

    this.enterEditMode = function () {
      saveFormData();
      self.editMode = true;
    };

    this.generatePassword = function () {
      this.generatingPassword = true;
      OvhApiFreeFax.v6().resetPassword({
        serviceName: $stateParams.serviceName,
      }, null).$promise.then((password) => {
        self.generatedPassword = password.value;
      }, err => new TucToastError(err)).finally(() => {
        self.generatingPassword = false;
      });
    };

    this.togglePassword = function () {
      this.showPassword = !this.showPassword;
      this.passwordDisplay = this.showPassword ? this.generatedPassword : '*****';
    };

    this.submit = function () {
      const formData = {
        faxMaxCall: $scope.freeFax.faxMaxCall,
        faxQuality: $scope.freeFax.faxQuality,
        faxTagLine: $scope.freeFax.faxTagLine,
        fromEmail: $scope.freeFax.fromEmail,
        fromName: $scope.freeFax.fromName,
      };
      self.loading = true;

      OvhApiFreeFax.v6().saveConfiguration({
        serviceName: $stateParams.serviceName,
      }, formData).$promise.then(() => {
        self.editMode = false;
      }, err => new TucToastError(err)).finally(() => {
        self.loading = false;
      });
    };
  });
