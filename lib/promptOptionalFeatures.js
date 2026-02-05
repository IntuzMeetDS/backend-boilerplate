import { confirm } from '@inquirer/prompts';

export async function promptOptionalFeatures(context) {
  context.options.redis = await confirm({
    message: 'Enable Redis integration?',
    default: false
  });
}
