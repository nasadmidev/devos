export default interface ProfileModel {
  id: string;
  userId: string;
  name: string;
  description: string;
  picture: string | null;
  interests: string[];
}
