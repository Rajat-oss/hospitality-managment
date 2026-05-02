const { execSync } = require('child_process');

try {
  console.log("Fetching latest branches...");
  execSync('git fetch --prune', { stdio: 'inherit' });

  console.log("Getting remote branches...");
  const branchesOutput = execSync('git branch -r', { encoding: 'utf-8' });
  const branches = branchesOutput.split('\n')
    .map(b => b.trim())
    .filter(b => b && b.startsWith('origin/') && !b.includes('HEAD') && !b.endsWith('/main') && !b.endsWith('/master'));

  if (branches.length === 0) {
    console.log("No extra branches found on GitHub to delete.");
    process.exit(0);
  }

  console.log(`Found ${branches.length} branches to delete from GitHub:`);
  branches.forEach(b => console.log(` - ${b}`));

  for (const branch of branches) {
    const branchName = branch.replace('origin/', '');
    console.log(`Deleting ${branchName} from GitHub...`);
    execSync(`git push origin --delete ${branchName}`, { stdio: 'inherit' });
  }

  console.log("All extra branches have been deleted from GitHub!");
} catch (error) {
  console.error("An error occurred while deleting branches:", error.message);
}
