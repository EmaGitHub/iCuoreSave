export const LocalConfig = {
    versioning: [
        {
            platform: 'android',
            lastVersion: '0.0.1',
            isMandatoryUpdate: false,
            storeLink: ''
        },
        {
            platform: 'ios',
            lastVersion: '0.0.1',
            isMandatoryUpdate: false,
            storeLink: ''
        }
    ],
    backend: {
        environment: 'PROD',
        baseUrl: 'https://ionictemplate.com/api',
        api : [
            {
                name : 'credentials',
                method: 'POST',
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: '/authentication/credentials'
            },
            {
                name : 'public',
                method: 'POST',
                url: '/authentication/public'
            },
            {
                name : 'getAccessToken',
                method : 'POST',
                url : '/authentication/getAccessToken'
            },
            {
                name : 'getUserProfile',
                method: 'POST',
                url : '/core/graphql'
            }
        ]
    },
    loggerLevel: 'DEBUG',
    devMode: false
}
