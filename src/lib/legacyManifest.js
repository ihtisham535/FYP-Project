// Load order matters: scripts share one global scope (same as the original single <script>).
export const LEGACY_SCRIPTS = [
  "/portals/shared/01-icons.js",
  "/portals/shared/02-data-model.js",
  "/portals/shared/03-helpers.js",
  "/portals/shared/04-verification-engine.js",
  "/portals/shared/05-core-actions.js",
  "/portals/shared/06-sidebars.js",
  "/portals/shared/07-charts-analytics.js",
  "/portals/shared/08-reports-engine.js",
  "/portals/admin/admin.js",
  "/portals/manufacturer/manufacturer.js",
  "/portals/vendor/vendor.js",
  "/portals/pharmacy/pharmacy.js",
  "/portals/doctor/doctor.js",
  "/portals/shared/09-table-filter.js",
  "/portals/shared/10-navigation.js",
  "/portals/shared/11-auth-flow.js",
  "/portals/patient/patient.js",
  "/portals/shared/12-toast.js"
];
