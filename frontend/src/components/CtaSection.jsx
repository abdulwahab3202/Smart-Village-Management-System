import React from 'react';

const CtaSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800">Ready to Make a Difference?</h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Join thousands of other citizens who are actively improving our city. Create an account today and let your voice be heard.
        </p>
        <div className="mt-8">
          <a href="#" className="inline-block bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg transform hover:scale-105">
            Register Now for Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
