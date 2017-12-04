angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.voicemail.activation", {
        url: "/activation",
        views: {
            "@faxView": {
                templateUrl: "app/telecom/telephony/fax/voicemail/activation/telecom-telephony-fax-voicemail-activation.html",
                controller: "TelecomTelephonyFaxVoicemailActivationCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/fax/voicemail/activation"
        ]
    });
});
