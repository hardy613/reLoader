# reloader
Reloads a page...

## options
- pageReloadTime                [ default: 300000 ] | The time (in milliseconds) to wait before reloading
- reLoadEventList               [ default: [] ] | User defined events that cause a reload
- focusedEventList              [ default: [] ] | User defined events that cause a timer reset
- useDefaultReLoadEventList     [ default: true ] | Should we use the default list
- useDefaultFocusedEventList    [ default: true ] | Should we use the default list
- useInitializationCallback      [ default: false] | Use user defined callback on init

## usage
1. Download `reLoader.js`
2. Add it to your project
3. ` new ReLoader( options, event => console.info(event)); `
