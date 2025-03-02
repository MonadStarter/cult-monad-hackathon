import Comment from "./Comment";
import Editor from "./Editor";
import Pagination from "~~/components/common/Pagination";
import { COMMENTS_DUMMY_DATA } from "~~/constants/mockData";

function CommentsSection() {
  return (
    <div>
      <Editor />
      <div className="flex flex-col gap-3 divide-y divide-white-4 py-2">
        {COMMENTS_DUMMY_DATA.map((comment, idx) => (
          <Comment key={idx} {...comment} />
        ))}
      </div>
      <Pagination totalPages={10} sibling={2} className="w-1/2" />
    </div>
  );
}

export default CommentsSection;
