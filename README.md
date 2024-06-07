# CASA-TypeScript
CASA project with TypeScript

## How to Run
Pull the repo, call `npm i` and then `npm start`. In your browser open `localhost:3000/start`.

# Breakdown
## tsconfig
```
{
  "compilerOptions": {
    "module": "commonjs",
    "outDir": "./dist",
    "esModuleInterop": true,
    "target": "es6",
    "resolveJsonModule": true,
  },
  "include": [
    "app"
  ],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```
`target`: node uses `commonjs`
`outDir`: output directory, doesn't matter what it's called as long as its consistent in the gulpfile
`esModuleInterop`: allows importing CJS modules into ESM project 
`target`: output language level (ECMAScript 6)
`resolveJsonModule`: allows importing json files 

We don't need to set `typeRoots` because `node_modules/@types` is included by default.

## gulpfile 
CASA projects typically use gulp to group everything together - it's especially useful because we need to grab some things from multiple places (like CSS, images and fonts from the `@dwp/govuk-casa` dependency) 

## Pitfalls
Some pitfalls I fell in to avoid: 
 1. Relative imports: TypeScript gets compiled to JavaScript in the `outDir` location, so using relative imports may cause confusion because the code that gets execute will have a different path
 2. CASA loves `object` type: sometimes digging through the code to figure out the structure of the object is the only solution
 3. `main` and `journey` templates: they exist in `node_modules/@dwp/govuk-casa/views/casa/layouts` directory, while the `template.njk` that they extends lives in `node_modules/govuk-frontend/govuk/template.njk`, it's useful to know this if you're going to modify any behaviour

