# reloader
Reloads a page...

## options
- pageReloadTime                [ default: 300000 ] | The time (in milliseconds) to wait before reloading
- reLoadEventList               [ default: [] ] | User defined events that cause a reload
- focusedEventList              [ default: [] ] | User defined events that cause a timer reset
- useDefaultReLoadEventList     [ default: true ] | Should we use the default list
- useDefaultFocusedEventList    [ default: true ] | Should we use the default list

## usage
` new ReLoader( {pageReloadTime: 3000}, event => console.info(event)); `
