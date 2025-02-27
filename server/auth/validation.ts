
import {createRemoteJWKSet, jwtVerify} from "jose";

//token validation
const JWKS_URL = "https://dev-robotron.eu.auth0.com/.well-known/jwks.json";
const jwks = createRemoteJWKSet(new URL(JWKS_URL));
export async function validateToken(data:any) {
    const { payload } = await jwtVerify(data.token, jwks, {
        issuer: "https://dev-robotron.eu.auth0.com/",
        audience: "k383oM5B2sBJnCGQALYNYorv4FbLEaab", // Replace with your Auth0 Client ID
    });

    if (!payload) {
        console.log("[User Validation] Token validation for user '"+data.user.name+"' failed: Unauthorized" )
        return null;
    }
    if (payload.sub !== data.user.sub) {
        console.log("[User Validation] Token validation for user '"+data.user.name+"' failed: Token does not match the given user" )
        return null;
    }
    console.log("[User Validation] Token validation for user '"+data.user.name+"' success.");
    return payload;
}
