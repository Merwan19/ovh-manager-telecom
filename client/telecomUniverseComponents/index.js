import angular from 'angular';

import tucChartjs from './chartjs';
import tucTableSort from './table-sort';
import tucTelecomFax from './telecom/fax';
import tucUnitHumanize from './unit/humanize';
import tucValidator from './validator';

export default angular
  .module('telecomUniverseComponents', [
    tucChartjs,
    tucTableSort,
    tucTelecomFax,
    tucUnitHumanize,
    tucValidator,
  ])
  .name;
