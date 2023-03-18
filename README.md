# react-pocketbase-authentication

Simple authentication provider and utils using React and Pocketbase

## Install

```bash
// with npm
npm i  react-pocketbase-authentication

// with yarn
yarn add react-pocketbase-authentication
```

## Usage

```jsx
import { AuthProvider, useAuthentication, ... } from 'react-pocketbase-authentication';

<AuthProvider client={yourPocketbaseClient} ...>
...
const { isAuthenticated, user, ... } = useAuthentication();
```
