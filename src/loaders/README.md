# loaders

This directory contains React components which support dynamic loading of components.

These allow us to break up the app into distinct parts so when a user is using the app they only download what they need
& not the entire app - e.g. if you don't use the service view then why download it each time?

## Known issues

During compilation ignore the warnings about:

```
System.import() is deprecated and will be removed soon. Use import() instead.
For more info visit https://webpack.js.org/guides/code-splitting/
```

This is due to us using `System.import()` which is deprecated and webpack is suggesting using `import()` instead.

The problem is that when we use:
```javascript
import( /* webpackChunkName: "departureboards" */ '../Departureboards')
```

Babel or Webpack (not certain where the issue is, think it's Babel) removes the comment so webpack then presumes we want
the imported component to be included in that chunk rather than it's own one.

Currently we have to use:
```javascript
System.import( /* webpackChunkName: "departureboards" */ '../Departureboards')
```

as that means that the imported component goes into it's own chunk & then only gets loaded in the browser when it's used.
