enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}

enum AuthType {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
  GITHUB = "GITHUB",
}

export default interface UserModel {
  id: string;
  email: string;
  oauthId: string | null;
  role: Role;
  authType: AuthType;
  password: string | null;
  createdAt: string;
  updatedAt: string;
}
