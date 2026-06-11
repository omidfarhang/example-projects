import { normalize, strings } from '@angular-devkit/core';
import { apply, mergeWith, move, template, url } from '@angular-devkit/schematics';

export default function feature(options) {
  return () => {
    const targetPath = normalize(`/${options.path}/${strings.dasherize(options.name)}`);
    const sourceTemplates = url('./files');
    const templateSource = apply(sourceTemplates, [
      template({
        ...options,
        classify: strings.classify,
        dasherize: strings.dasherize,
      }),
      move(targetPath),
    ]);

    return mergeWith(templateSource);
  };
}
