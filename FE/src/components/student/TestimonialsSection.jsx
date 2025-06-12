import { assets, dummyTestimonial } from "../../assets/assets";

const TestimonialsSection = () => {
  return (
    <>
      <div className="flex flex-col items-center space-y-7 text-center">
        <h1 className="text-3xl font-medium text-gray-800">Testimonials</h1>
        <p className="text-sm md:text-base text-gray-400 ">
          Here from our learners as they share their journeys of transformation,
          success, & how our <br /> platform has made a difference in their
          lives.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 md:px-12 px-5">
          {dummyTestimonial.map((testimonial, index) => {
            return (
              <div
                key={index}
                className="text-sm text-left border border-gray-500/30 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/30 overflow-hidden hover:-translate-y-1.5 duration-300 ease-linear"
              >
                <div className="flex items-center gap-4 px-5 py-4 bg-gray-500/10">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />

                  <div>
                    <h1 className="text-lg font-medium text-gray-800">
                      {testimonial.name}
                    </h1>
                    <p className="text-xs text-gray-800/80">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="p-5 pb-7">
                  <div className="flex gap-0.5">
                    {[...Array(5).keys()].map((_, i) => (
                      <img
                        className="w-5 h-5"
                        key={i}
                        src={
                          i < Math.floor(testimonial.rating)
                            ? assets.star
                            : assets.star_blank
                        }
                        alt="star"
                      />
                    ))}
                  </div>
                  <p className="text-gray-500 mt-5">{testimonial.feedback}</p>
                </div>
                <a href="#" className="text-blue-500 underline px-5">
                  Read More
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TestimonialsSection;
