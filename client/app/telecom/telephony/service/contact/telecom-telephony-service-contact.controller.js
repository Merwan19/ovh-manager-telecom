angular.module('managerApp').controller('TelecomTelephonyServiceContactCtrl', function ($state, $stateParams, $q, $timeout, $translate, OvhApiTelephony, TucToast, TucToastError, OvhApiXdsl, tucTelephonyBulk) {
  const self = this;

  function buildWayInfo(directory) {
    if (!directory.wayNumber.length) {
      _.set(directory, 'wayNumber', directory.address.replace(/\D/g, ''));
    }

    if (!directory.wayNumberExtra.length) {
      _.set(directory, 'wayNumberExtra', _.find(self.wayNumberExtraEnum, extra => _.some(_.words(directory.address), word => word === extra)));
    }

    if (!directory.wayName.length) {
      _.set(directory, 'wayName', directory.address.replace(/\d+/g, '').replace(directory.wayNumberExtra, ''));
    }
  }

  function fetchDirectory() {
    return OvhApiTelephony.Service().v6()
      .directory({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }).$promise;
  }

  function fetchDirectoryServiceCode(ape) {
    return OvhApiTelephony.Service().v6()
      .getDirectoryServiceCode({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        apeCode: ape,
      }).$promise
      .then(result => _.map(result, (info) => {
        _.set(info, 'directoryServiceCode', `${info.directoryServiceCode || ''}`);
        return info;
      }));
  }

  function init() {
    self.isLoading = true;
    self.isEditing = false;

    // TODO : remove once bulk action for fax is available
    self.isFax = $state.current.name.indexOf('fax') > -1;

    self.wayNumberExtraEnum = [
      'bis', 'ter', 'quater', 'quinquies', 'sexto', 'septimo', 'octimo', 'nono',
      'A', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'S', 'U', 'V',
      'W', 'X', 'Y', 'Z',
    ];
    self.directoryCodes = null;
    return $q.all({
      infos: OvhApiTelephony.v6().schema().$promise,
      directory: fetchDirectory(),
    }).then((res) => {
      self.directory = res.directory;
      buildWayInfo(self.directory);

      self.directoryForm = angular.copy(self.directory);
      self.cityList = [{ name: self.directory.city }];
      self.onPostCodeChange();
      if (self.directory.ape && self.directory.directoryServiceCode) {
        return fetchDirectoryServiceCode(self.directory.ape).then((result) => {
          self.directoryCodes = result;
        });
      }

      self.directoryProperties = _.get(res.infos, "models['telephony.DirectoryInfo'].properties");
      return null;
    }).catch(err => new TucToastError(err)).finally(() => {
      self.isLoading = false;
    });
  }

  /**
   * Some attributes are not shared between different legal form so we have to reset
   * them when user choose another legal form.
   */
  self.onChangeLegalForm = function () {
    self.directoryForm = _.assign(self.directoryForm, _.omit(self.directory, 'legalForm'));
    switch (self.directoryForm.legalForm) {
      case 'individual':
        self.directoryForm.siret = '';
        self.directoryForm.ape = '';
        self.directoryForm.socialNomination = '';
        self.directoryForm.socialNominationExtra = '';
        self.directoryForm.directoryServiceCode = '';
        self.directoryForm.PJSocialNomination = '';
        self.directoryForm.occupation = '';
        break;
      case 'professional':
        self.directoryForm.name = '';
        self.directoryForm.firstName = '';
        break;
      case 'corporation':
        self.directoryForm.name = '';
        self.directoryForm.firstName = '';
        self.directoryForm.occupation = '';
        break;
      default:
        break;
    }
  };

  self.applyChanges = function () {
    if (self.directoryForm.legalForm !== 'individual') {
      self.directoryForm.PJSocialNomination = self.directoryForm.socialNomination;
    }
    const modified = _.assign(self.directory, self.directoryForm);
    self.isUpdating = true;
    return OvhApiTelephony.Service().v6().changeDirectory({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
    }, modified).$promise.then(() => {
      self.directory = angular.copy(self.directoryForm);
      self.isEditing = false;
      TucToast.success($translate.instant('telephony_service_contact_success'));
    }).catch(err => new TucToastError(err)).finally(() => {
      self.isUpdating = false;
    });
  };

  self.bulkDatas = {
    billingAccount: $stateParams.billingAccount,
    serviceName: $stateParams.serviceName,
    infos: {
      name: 'contact',
      actions: [{
        name: 'directory',
        route: '/telephony/{billingAccount}/service/{serviceName}/directory',
        method: 'PUT',
        params: null,
      }],
    },
  };

  self.getBulkParams = function () {
    return _.pick(self.directoryForm, (value, key) => _.get(self.directoryProperties, [key, 'readOnly']) === 0);
  };

  self.onBulkSuccess = function (bulkResult) {
    // display message of success or error
    tucTelephonyBulk.getTucToastInfos(bulkResult, {
      fullSuccess: $translate.instant('telephony_service_contact_bulk_all_success'),
      partialSuccess: $translate.instant('telephony_service_contact_bulk_some_success', {
        count: bulkResult.success.length,
      }),
      error: $translate.instant('telephony_service_contact_bulk_error'),
    }).forEach((toastInfo) => {
      TucToast[toastInfo.type](toastInfo.message, {
        hideAfter: null,
      });
    });

    init();
  };

  self.onBulkError = function (error) {
    TucToast.error([$translate.instant('telephony_service_contact_bulk_on_error'), _.get(error, 'msg.data')].join(' '));
  };

  self.onPostCodeChange = (function () {
    // var pendingRequest = null;
    return function () {
      // self.directoryForm.postCode =
      //   (self.directoryForm.postCode || "").replace(/[^\d]/g, "").substring(0, 5);

      if (self.directoryForm.postCode !== self.directory.postCode) {
        self.directoryForm.urbanDistrict = '';
      }

      /*
        * @TODO uncomment when city autocomplete available in api
        *
      // Fetch cities for given post code
      if (self.directoryForm.postCode.length >= 3) {
          if (pendingRequest && pendingRequest.$cancelRequest) {
              pendingRequest.$cancelRequest();
          }
          self.isCityListLoading = true;
          pendingRequest = OvhApiTelephony.Number().v6().getZones({
              axiom: self.directoryForm.postCode,
              country: self.directoryForm.country.toLowerCase()
          });
          pendingRequest.$promise.then(function (cities) {
              self.cityList = _.map(cities, function (city) {
                  return city.toUpperCase();
              });
              // automatically select first city
              if (cities.length) {
                  self.directoryForm.city = _.head(cities).name;
              }
              // parse urban district
              if (self.isUrbanDistrictRequired()) {
                self.directoryForm.urbanDistrict =
                  "" + parseInt(self.directoryForm.postCode.slice(-2), 10);
              }
          })["finally"](function () {
              self.isCityListLoading = false;
          });
      } else {
          self.cityList = [];
      }
      */
    };
  }());

  self.onSiretChange = (function () {
    const pendingRequest = null;
    return function (model) {
      if (self.directoryForm.siret && self.directoryForm.siret.length >= 9) {
        if (pendingRequest) {
          pendingRequest.$cancelRequest();
        }

        // we have to poll because api call is not synchronous :(
        const fetchInfos = function (siret) {
          return OvhApiTelephony.Service().v6().fetchDirectoryEntrepriseInformations({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
          }, {
            entrepriseNumber: siret,
          }).$promise.then((infos) => {
            if (infos.status === 'todo') {
              return $timeout(() => fetchInfos(siret), 500);
            }
            return infos;
          });
        };

        // we take only first 10 chars which is SIREN code
        fetchInfos(self.directoryForm.siret.substring(0, 9)).then((infos) => {
          if (infos.informations.isValid) {
            self.directoryForm.ape = infos.informations.ape;
            self.directoryForm.socialNomination = infos.informations.name;
            self.directoryCodes = null;

            // fetch directory codes for given APE
            if (self.directoryForm.ape) {
              fetchDirectoryServiceCode(self.directoryForm.ape).then((result) => {
                self.directoryCodes = result;
              });
            }
            model.$setValidity('siret', true);
          } else {
            self.directoryForm.ape = null;
            self.directoryForm.socialNomination = null;
            self.directoryCodes = null;
            model.$setValidity('siret', false);
          }
        }).catch(err => new TucToastError(err));
      }
    };
  }());

  // arrondissements pour paris 75xxx, marseille 13xxx et lyon 69xxx (92 izi?)
  self.isUrbanDistrictRequired = function () {
    const p = self.directoryForm.postCode;
    return _.startsWith(p, '75') || _.startsWith(p, '13') || _.startsWith(p, '69');
  };

  self.onCityChange = function () {
    self.wayList = [];
    self.directoryForm.wayName = '';
  };

  self.getWayNameList = (function () {
    let pendingRequest = null;
    return function (partialName) {
      let result = $q.when([]);
      if (partialName.length >= 3) {
        if (pendingRequest) {
          pendingRequest.$cancelRequest();
        }
        const city = _.find(self.cityList, { name: self.directoryForm.city });
        if (city) {
          self.isWayListLoading = true;
          pendingRequest = OvhApiXdsl.v6().eligibilityStreets({
            inseeCode: city.inseeCode,
            partialName,
          });
          pendingRequest.$promise.finally(() => {
            self.isWayListLoading = false;
          });
          result = pendingRequest.$promise;
        }
      }
      return result;
    };
  }());

  self.getDisplayFirstNameOptions = function (displayFirstName) {
    if (displayFirstName) {
      return `${self.directoryForm.firstName} ${self.directoryForm.name}`;
    }
    return `${self.directoryForm.firstName.substring(0, 1)}. ${self.directoryForm.name}`;
  };

  self.findDirectoryService = function () {
    return _.find(self.directoryCodes, info => `${info.directoryServiceCode}` === `${self.directory.directoryServiceCode}`);
  };

  self.cancelEdition = function () {
    self.isEditing = false;
    self.directoryForm = angular.copy(self.directory);
  };

  self.isShortForm = function () {
    return ['fr', 'be'].indexOf(self.directory.country) < 0;
  };

  init();
});
