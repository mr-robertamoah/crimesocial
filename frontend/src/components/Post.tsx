import { PostType } from "../types";

export default function Post({ post = null }: { post: PostType | null}) {
    if (!post) return (<></>)
    return (
        <div>{post.id}</div>
    )
}