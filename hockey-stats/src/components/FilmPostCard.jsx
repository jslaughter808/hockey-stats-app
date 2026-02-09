import YouTubeSegmentPlayer from "./YouTubeSegmentPlayer";

export default function FilmPostCard({ post }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{post.title}</h3>

      <p className="small" style={{ whiteSpace: "pre-wrap" }}>
        {post.message}
      </p>

      <YouTubeSegmentPlayer
        videoId={post.youtubeId}
        startSeconds={post.startSeconds}
        endSeconds={post.endSeconds}
        loop={true}
        defaultRate={1}
      />
    </div>
  );
}
