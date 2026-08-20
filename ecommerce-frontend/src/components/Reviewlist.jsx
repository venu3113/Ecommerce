function ReviewList({ reviews = [] }) {

  return (
    <div className="mt-12 rounded-xl border bg-white p-8 shadow">

      <h2 className="mb-8 text-3xl font-bold">
        Customer Reviews
      </h2>

      {reviews.length === 0 ? (

        <p className="text-gray-500">
          No reviews available.
        </p>

      ) : (

        <div className="space-y-6">

          {reviews.map((review, index) => (

            <div
              key={index}
              className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-semibold text-blue-600">
                    {review.reviewerName}
                  </h3>

                  {Math.round(review.rating) === 5 && (
                    <span className="mt-1 inline-block rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-700">
                      ✔ Verified Purchase
                    </span>
                  )}

                  {/* <p className="mt-1 text-sm text-gray-500">
                    {review.reviewerEmail}
                  </p> */}

                </div>

                <span className="rounded-lg bg-green-600 px-3 py-1 font-semibold text-white">
                  {"⭐".repeat((review.rating))}
                </span>

              </div>

              <p className="mt-5 text-gray-700">
                {review.comment}
              </p>

              <p className="mt-4 text-sm text-gray-400">
                {review.date}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default ReviewList;