const { spawnSync } = require('child_process');
const fs = require('fs');
const result = spawnSync('git', ['--no-pager', 'show', 'HEAD^:server/src/modules/dashboard/dashboard.controller.ts'], { encoding: 'utf-8' });
if (result.stdout) {
  fs.writeFileSync('/tmp/dash_ctrl.txt', result.stdout);
}
console.log("Done", result.status);
