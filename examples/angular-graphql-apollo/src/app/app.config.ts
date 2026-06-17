import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { SchemaLink } from '@apollo/client/link/schema';

import { environment } from '../environments/environment';
import { createPlaygroundSchema } from './graphql/playground-schema';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    ...(environment.playground ? [] : [provideHttpClient()]),
    provideApollo(() => {
      if (environment.playground) {
        return {
          link: new SchemaLink({ schema: createPlaygroundSchema() }),
          cache: new InMemoryCache(),
        };
      }

      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: 'http://localhost:4000/graphql' }),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
