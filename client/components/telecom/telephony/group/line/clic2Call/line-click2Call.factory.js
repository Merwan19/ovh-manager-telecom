angular.module('managerApp').factory(
  'TelephonyGroupLineClick2Call',
  ($q, OvhApiTelephony, TelephonyGroupLineClick2CallUser) => {
    const mandatoriesPhoneOptions = [
      'billingAccount',
      'serviceName',
    ];
    let mandatoryNb;

    /*= ==================================
        =            CONSTRUCTOR            =
        =================================== */

    function TelephonyGroupLineClickToCall(mandatoryOptions) {
      mandatoryNb = mandatoriesPhoneOptions.length;
      if (!mandatoryOptions) {
        throw new Error('mandatory options must be specified when creating a new TelephonyGroupLineClick2CallUser');
      } else {
        for (mandatoryNb; mandatoryNb--;) { // eslint-disable-line
          if (!mandatoryOptions[mandatoriesPhoneOptions[mandatoryNb]]) {
            // check mandatory attributes
            throw new Error(`${mandatoriesPhoneOptions[mandatoryNb]} option must be specified when creating a new TelephonyGroupLineClick2CallUser`);
          } else {
            // set mandatory attributes
            this[mandatoriesPhoneOptions[mandatoryNb]] =
              mandatoryOptions[mandatoriesPhoneOptions[mandatoryNb]];
          }
        }
      }

      this.users = [];
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
        =            PROTOTYPE METHODS            =
        ========================================= */

    TelephonyGroupLineClickToCall.prototype.getUsers = function () {
      const self = this;
      self.users = [];

      return OvhApiTelephony.Line().Click2Call().User().v6()
        .query({
          billingAccount: self.billingAccount,
          serviceName: self.serviceName,
        }, null).$promise.then((users) => {
          const request = [];

          angular.forEach(users, (userId) => {
            const user = new TelephonyGroupLineClick2CallUser({
              billingAccount: self.billingAccount,
              serviceName: self.serviceName,
            }, {
              id: userId,
            });

            request.push(user.getUser().then((userDetails) => {
              self.users.push(userDetails);
              return userDetails;
            }));
          });

          return $q.all(request).finally(() => self.users);
        }, () => $q.when(self.users));
    };

    TelephonyGroupLineClickToCall.prototype.call = function (calledNumber) {
      const self = this;

      return OvhApiTelephony.Line().Click2Call().v6().post({
        billingAccount: self.billingAccount,
        serviceName: self.serviceName,
      }, {
        calledNumber,
      }).$promise.then(voidResponse => voidResponse);
    };

    return TelephonyGroupLineClickToCall;
  },
);
