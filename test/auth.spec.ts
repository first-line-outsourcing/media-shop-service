import * as authFunc from '../api/auth/handler';
import { expect } from 'chai';
import * as LT from 'lambda-tester';

describe('checking authorization', () => {

    it('Check authorization if authorization token is absent', () => {
        return LT(authFunc.auth)
            .event({
                authorizationToken: null
            })
            .expectError((err) => expect(err.message).to.equal('[401] Unauthorized'));
    });

    it('Check authorization if token is exist and this token is correct', () => {
        return LT(authFunc.auth)
            .event({
                authorizationToken: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL215dGVhbS1zaG9wLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJ2a29udGFrdGV8OTU4NTE3MDQiLCJhdWQiOiJoZkR4NldYUzJua2NMVWhPY0hlMFhxMzRsWkUzd2ZySCIsImV4cCI6MTUwMzA0MDgxNywiaWF0IjoxNTAzMDA0ODE3fQ.IwsUZJzX4higxcwAdtZ-oQ3wV0cbkZ3Y6TC1AEVSubc'
            })
            .expectResult((result) => {
                const [social, socialId] = result.principalId.split('|');
                expect(social).to.equal('vkontakte');
                expect(socialId).to.equal('95851704')
            });
    });

    it('Check authorization if token is exist and this token is not correct', () => {
        return LT(authFunc.auth)
            .event({
                authorizationToken: 'Bearer IwsUZJzX4higxcwAdtZ-oQ3wV0cbkZ3Y6TC1AEVSubc'
            })
            .expectError((err) => expect(err.message).to.equal('[401] Unauthorized'));
    });

});
