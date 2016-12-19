/**
 * Created by jmartinez on 12/15/2016.
 */
module.exports = {
    servers: {
        one: {
            host: '10.0.1.23',
            username: 'drcog',
            // pem: '/home/user/.ssh/id_rsa', // mup doesn't support '~' alias for home directory
            password: 'Metier5*$ed',
            // or leave blank to authenticate using ssh-agent
            opts: {
                port: 22,
            }
        }
    },

    meteor: {
        name: 'app',
        path: '../', // mup doesn't support '~' alias for home directory
        //port: 8000, // useful when deploying multiple instances (optional)
        volumes: { // lets you add docker volumes (optional)
            // "/host/path": "/container/path", // passed as '-v /host/path:/container/path' to the docker run command
            // "/second/host/path": "/second/container/path"
        },
        docker: {
            //image: 'kadirahq/meteord', // (optional)
            image: 'abernix/meteord:base' // use this image if using Meteor 1.4+
            // args:[ // lets you add/overwrite any parameter on the docker run command (optional)
            //     "--link=myCustomMongoDB:myCustomMongoDB", // linking example
            //     "--memory-reservation 200M" // memory reservation example
            // ]
        },
        servers: {
            one: {} // list of servers to deploy, from the 'servers' list
        },
        buildOptions: {
            serverOnly: true,
            debug: true,
            cleanAfterBuild: true // default
            //buildLocation: '/my/build/folder' // defaults to /tmp/<uuid>
            //mobileSettings: {
            //    yourMobileSetting: "setting value"
            //}
        },
        env: {
            METEOR_ALLOW_SUPERUSER : true,
            ROOT_URL: 'http://10.0.1.23/',
            MONGO_URL: 'mongodb://localhost/meteor'
        },
        //log: { // (optional)
        //    driver: 'syslog',
        //    opts: {
        //       "syslog-address":'udp://syslogserverurl.com:1234'
        //    }
        //},
        deployCheckWaitTime: 60 // default 10
    },

    mongo: { // (optional)
        oplog: true,
        port: 27017,
        servers: {
            one: {},
        },
    },
}
