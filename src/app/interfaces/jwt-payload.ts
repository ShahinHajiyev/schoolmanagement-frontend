export interface JwtAuthority {
  authority: string;
}

export interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  authorities: JwtAuthority[];
}
