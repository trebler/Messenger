enum JwtHeaders {
    name = 'x-jwt-name',
    sub = 'x-jwt-sub',
    roles = 'x-jwt-roles',
    exp = 'x-jwt-exp',
}

interface JwtClaims {
    roles: string[];
    sub: string;
    exp: number;
    name: string;
}

export const prepareJwtHeaders = (claims: JwtClaims): Record<JwtHeaders, string> => {
    const { sub, roles, exp, name } = claims;

    return {
        [JwtHeaders.exp]: `${exp}`,
        [JwtHeaders.name]: name,
        [JwtHeaders.roles]: roles.join(','),
        [JwtHeaders.sub]: sub,
    };
};
