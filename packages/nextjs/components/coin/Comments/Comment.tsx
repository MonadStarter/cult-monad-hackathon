import { dayjs } from "~~/dayjs";
import { LikeIconFill, LikeIconOutline } from "~~/icons/symbols";
import { Comment as CommentType } from "~~/types/types";

function Comment({ author, profileIconUrl, content, likes, createdAt, liked }: CommentType) {
  return (
    <div className="flex gap-4 p-3 w-full">
      <img src={profileIconUrl} width="40px" height="40px" alt={author} className="rounded-full profile-icon" />
      <div className="w-full flex flex-col gap-3">
        <div className="flex justify-between w-full">
          <h5>{author}</h5>
          <div className="flex gap-4">
            <p className="text-white-76 text-xs flex gap-1">
              {liked ? <LikeIconFill /> : <LikeIconOutline />} {likes} Likes
            </p>
            <p className="text-white-76 text-xs">{dayjs(createdAt).fromNow()}</p>
          </div>
        </div>
        <p className="text-white-76 text-sm">{content}</p>
      </div>
    </div>
  );
}

export default Comment;
