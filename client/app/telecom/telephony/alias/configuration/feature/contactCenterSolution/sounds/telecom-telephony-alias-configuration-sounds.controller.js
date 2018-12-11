angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationSoundsCtrl', class TelecomTelephonyAliasConfigurationSoundsCtrl {
  constructor(
    $q, $state, $stateParams, $translate, $uibModal,
    featureTypeLabel, OvhApiTelephony, TucToast, tucVoipServiceAlias,
  ) {
    this.$q = $q;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.$uibModal = $uibModal;
    this.featureTypeLabel = featureTypeLabel;
    this.OvhApiTelephony = OvhApiTelephony;
    this.TucToast = TucToast;
    this.tucVoipServiceAlias = tucVoipServiceAlias;
  }

  $onInit() {
    this.serviceInfos = {
      billingAccount: this.$stateParams.billingAccount,
      serviceName: this.$stateParams.serviceName,
    };
    this.loading = true;

    return this.$q.all({
      options: this.tucVoipServiceAlias.fetchContactCenterSolutionNumber(this.serviceInfos),
      queueOptions: this.tucVoipServiceAlias
        .fetchContactCenterSolutionNumberQueues(this.serviceInfos),
      sounds: this.tucVoipServiceAlias
        .fetchContactCenterSolutionNumberSounds(this.serviceInfos),
    })
      .then(({ options, queueOptions, sounds }) => {
        this.options = options;
        [this.queueOptions] = queueOptions;
        this.sounds = sounds.concat({ soundId: null, name: this.$translate.instant('none') }).reverse();
        this.maxWaitTime = Math.round(this.queueOptions.maxWaitTime / 60);

        this.copyOptions = angular.copy(this.options);
        this.copyQueueOptions = angular.copy(this.queueOptions);

        this.toneOnOpening = this.sounds
          .find(sound => sound.soundId === this.options.toneOnOpening);
        this.toneOnHold = this.sounds
          .find(sound => sound.soundId === this.options.toneOnHold);

        const overflowPlayback = this.sounds
          .find(sound => sound.soundId === parseInt(this.queueOptions.actionOnOverflowParam, 10));
        this.overflowPlayback = overflowPlayback || _.first(this.sounds);

        const closurePlayback = this.sounds
          .find(sound => sound.soundId === parseInt(this.queueOptions.actionOnClosureParam, 10));
        this.closurePlayback = closurePlayback || _.first(this.sounds);
      })
      .catch((error) => {
        this.TucToast.error(
          `${this.$translate.instant('telephony_alias_config_contactCenterSolution_sounds_get_options_error')} ${_.get(error, 'data.message', error.message)}`,
        );
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onChooseServicePopover() {
    return ({ serviceName }, optionToSet) => {
      _.set(this.queueOptions, optionToSet, serviceName);
    };
  }

  openManageSoundsHelper(modelToUpdate) {
    this.$uibModal.open({
      animation: true,
      templateUrl: 'app/telecom/telephony/alias/configuration/feature/contactCenterSolution/sounds/add/telecom-telephony-alias-configuration-contactCenterSolution-sounds-add.html',
      controller: 'TelecomTelephonyAliasConfigurationContactCenterSolutionSoundsAddCtrl',
      controllerAs: '$ctrl',
      resolve: {
        sounds: () => this.sounds.filter(({ soundId }) => soundId),
      },
    }).result.then((sound) => {
      _.set(this, modelToUpdate, sound);
      this.sounds.push(sound);

      switch (modelToUpdate) {
        case 'toneOnOpening':
        case 'toneOnHold':
          _.set(this.options, modelToUpdate, _.get(this, `${modelToUpdate}.soundId`, null));
          break;
        case 'actionOnClosureParam':
          this.closurePlayback = _.get(this, `${modelToUpdate}.soundId`, null);
          _.set(this.queueOptions, modelToUpdate, this.closurePlayback);
          break;
        case 'actionOnOverflowParam':
          this.overflowPlayback = _.get(this, `${modelToUpdate}.soundId`, null);
          _.set(this.queueOptions, modelToUpdate, this.overflowPlayback);
          break;
        default: break;
      }
    });
  }

  fetchSounds() {
    return this.tucVoipServiceAlias.fetchContactCenterSolutionNumberSounds(this.serviceInfos);
  }

  hasOptionsChanged() {
    return !angular.equals(this.options, this.copyOptions);
  }

  hasQueueOptionsChanged() {
    return !angular.equals(this.queueOptions, this.copyQueueOptions);
  }

  hasChanged() {
    return this.hasOptionsChanged() || this.hasQueueOptionsChanged();
  }

  updateContactCenterSolution() {
    this.loading = true;

    return this.$q.all({
      ccsOptions: this.hasOptionsChanged() ? this.tucVoipServiceAlias
        .updateContactCenterSolutionNumber(
          this.serviceInfos,
          this.options,
        ) : this.$q.when(),
      ccsQueueOptions: this.hasQueueOptionsChanged() ? this.tucVoipServiceAlias
        .updateContactCenterSolutionNumberQueue(
          this.serviceInfos,
          this.queueOptions,
        ) : this.$q.when(),
    })
      .then(() => this.$state.go('^').then(() => {
        this.TucToast.success(this.$translate.instant('telephony_alias_config_contactCenterSolution_sounds_update_success'));
      }))
      .catch((error) => {
        this.TucToast.error(
          `${this.$translate.instant('telephony_alias_config_contactCenterSolution_sounds_update_error')} ${_.get(error, 'data.message', error.message)}`,
        );
      })
      .finally(() => {
        this.loading = false;
      });
  }
});
