{{#success}}

### {{projectName}} deployed successfully

Preview at {{{deploymentUrl}}}
Inspect at {{{inspectUrl}}}
{{/success}}
{{^success}}

### {{projectName}} deploy failed

Please check the CI logs for details.
{{/success}}
