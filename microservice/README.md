  # Person Search Microservice

This microservice searches for persons using the configured search by attributes using the EEDM persons resource with various criteria.

This microservice is implemented as a Serverless.com project which uses a JavaScript Lambda function in AWS. This extension makes CORS (Cross-Origin Resource Sharing) API calls to an AWS Gateway that triggers an AWS Lambda function. This Lambda function authorizes requests and queries Ethos Integration.

The ```/api/person-search``` endpoint does the following:
1. Allows CORS calls from Experience origins.
1. Verifies and decodes the Experience Extension JWT passed from the browser side extension.
1. Calls the card server configuration endpoint on Experience to retrieve the configuration needed to search and return a result.
1. It makes one or more parallel queries to the Ethos EEDM persons resource to search by the configured Search By attributes.
1. It then combines all results and transforms the response as needed for the PersonSearch card. This includes only sending back the attributes required to show the results and launch the Page or URL.

# Setup

To deploy a lambda function and the associated resources using this Serverless.com project, you will need an AWS account, AWS credentials defined in your terminal of choice with sufficient permissions. A guide to AWS Credentials for Serverless can be found at https://www.serverless.com/framework/docs/providers/aws/guide/credentials/.

# Quick Start

To run the Lambda function locally in offline mode do the following

1. Open a terminal and cd to the ```microservice``` directory.
1. Execute `npm install` to install all the node modules needed.
1. Create .env. Copy the sample.env file to .env and add the JWT_SECRET and EXTENSION_API_TOKEN from Experience Setup Extension Management.
1. Execute `npm start`. This will run the npm script 'npx serverless offline --stage dev'.

It will start an endpoint listening on port 3000. It will show you in a box with the GET URL. Copy this URL to use to configure the card up to the /api portion. It should be ```http://localhost:3000/api```

## JWT secret and extension API Token
You will need to create a JWT secret to share with the Extension Management and use in the .env file. This secret needs to be between 32 to 50 characters.

Once the extension is uploaded, an Extension API Token needs to be generated. Use Experience Setup Extension Management and edit the extension. Enter the JWT secret and then click on the "GENERATE API TOKEN" button. This will generate a Token that the server side can use to call back to Experience and get card configuration. Copy the generated token and add it to the .env file as the value for EXTENSION_API_TOKEN

## Other .env values for AWS Tags
The following vars are listed in sample.env and can be used for tagging the AWS resources. See the serverless.yml blocks for tags. You can use or remove them as desired.

## Configure Card

Please follow the readme for the [extension](../extension/README.md) to build, deploy and configure the extension cards.

## CORS and Serverless Offline

When running this the first time, serverless offline won't properly return CORS headers if you use the allowedOrigins block. The workaround is to set the ```httpApi.cors``` value in serverless.yml to 'true' initially or always when using serverless offline (running locally). When you deploy to AWS, it is recommended you use the commented-out cors block to be more restrictive of what websites can access your Lambda endpoints.

<br/>
<div style="display: flex; justify-content: center">
Copyright 2021–2023 Ellucian Company L.P. and its affiliates.
</div>

  

