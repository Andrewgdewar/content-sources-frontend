## Initial etc/hosts setup

In order to access the https://[env].foo.redhat.com in your browser, you have to add entries to your `/etc/hosts` file. This is a **one-time** setup that has to be done only once (unless you modify hosts) on each machine.

To setup the hosts file run following command:

```bash
npm run patch:hosts
```

If this command throws an error, you may need to install NPM system wide with `sudo yum install npm` and run it as a `sudo`:

```bash
sudo npm run patch:hosts
```

Alternativly, simply add these lines to your /etc/hosts:
```
127.0.0.1 prod.foo.redhat.com
::1 prod.foo.redhat.com
127.0.0.1 stage.foo.redhat.com
::1 stage.foo.redhat.com
127.0.0.1 qa.foo.redhat.com
::1 qa.foo.redhat.com
127.0.0.1 ci.foo.redhat.com
::1 ci.foo.redhat.com
```

## Getting started

1. Make sure [nvm](https://github.com/nvm-sh/nvm) is installed

2. First time running the app do: `nvm use` to ensure you have the correct node version installed. If you do not, follow the instructions nvm gives you to install the appropriate version.

3. `npm install`

4. `npm run build` (only required when setting up for the first time)

5. `npm run start` to choose whether to run against stage or prod environments. <br/>
   OR <br/>
   `npm run start:stage` to run against stage environment. <br/>
   OR <br/>
   `npm run start:prod` to run against prod environment. <br/>
   OR <br/>
   `npm run local` to run against a local backend running on port 8000. <br/>
   (keep in mind that you have to be connected to the VPN for this to work, even in the offices)

6. With a browser, open URL listed in the terminal output


Update `config/dev.webpack.config.js` according to your application URL. [Read more](https://github.com/RedHatInsights/frontend-components/tree/master/packages/config#useproxy).

### Testing

`npm run verify` will run `npm run lint` (eslint) and `npm test` (Jest)

## Deploying

- The starter repo uses Travis to deploy the webpack build to another Github repo defined in `.travis.yml`
  - That Github repo has the following branches:
    - `ci-beta` (deployed by pushing to `master` or `main` on this repo)
    - `ci-stable` (deployed by pushing to `ci-stable` on this repo)
    - `qa-beta` (deployed by pushing to `qa-beta` on this repo)
    - `qa-stable` (deployed by pushing to `qa-stable` on this repo)
    - `prod-beta` (deployed by pushing to `prod-beta` on this repo)
    - `prod-stable` (deployed by pushing to `prod-stable` on this repo)
- Travis uploads results to RedHatInsight's [codecov](https://codecov.io) account. To change the account, modify CODECOV_TOKEN on https://travis-ci.com/.
