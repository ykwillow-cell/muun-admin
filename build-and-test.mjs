import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  try {
    console.log('🔨 Building project...');
    await execAsync('pnpm build');
    console.log('✅ Build successful');
    
    console.log('\n📦 Checking dist folder...');
    const { stdout } = await execAsync('ls -la dist/ | head -20');
    console.log(stdout);
    
    console.log('\n✅ Build verification complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
