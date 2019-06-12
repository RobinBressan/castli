# Castli Core

This package is the foundation of castli, it is framework-agnostic and contains all the domain logic.

## Fortress

A fortress represents the authentication layer. It's backed by a state machine which has the following states:

* *idle*: The fortress is initialized and waiting for any event
* *unauthenticated*: The fortress is not authenticated. It happens either when you call `fortress.deauthenticate()` or if a challenge fails.
* *challenging*: The fortress is performing a challenge through its proxy. If it works, it could either go back to `idle` state (this is the case when you ask for re-challenging like for 2FA) or go to `authenticated` state.
* *authenticated*: The fortress is authenticated. It can now be used to create some firewall to handle the authorization layer.

To be created, a fortress needs two arguments, a *Proxy* and a *Guard*:

```js
const proxy = {
    challenge(
        query: Record<string, any>,
        previousChallenges: Array<Record<string, any>>,
        rechallenge: () => void
    ) {
        // Your logic goes here. You must return a challenge. Depending on your choice it can be a promise or not.
        // A challenge is just a litteral object which contains anything like a token for instance.
        // If you want to trigger a new challenge for 2FA, just call rechallenge().
        // On the 2nd call (if you called 2FA), previousChallenges will contains the previous challenge.
    },
    provision(
        query: Record<string, any>,
        challenges: Array<Record<string, any>>
    ) {
        // Your logic goes here. You must return a litteral object containing a permissions key and a user key.
        // Depending on your choice it can be a promise or not.
        // This will be called by any firewall you've created using your fortress, we'll talk about firewall after

        return { permissions: ['example.write'], user: { name: 'Bob' } }
    }
};
```

```js
function guard(
    query: Record<string, any>,
    user: Record<string, any>,
    permissions: Array<Record<string, any>>,
    challenges: Array<Record<string, any>>
) {
    // Your logic goes here. You must a boolean.
    // Depending on your choice it can be a promise or not.
    // This will be called by any firewall you've created using your fortress, we'll talk about firewall after
    return true;
}
```

```js
const fortress = new Fortress(proxy, guard);
```
