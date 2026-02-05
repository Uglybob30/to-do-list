function Register() {
  return (
    <> 
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 transition px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-gray-200 transition-all">

          <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 tracking-wide">
            Create Account
          </h1>

          <form className="space-y-4">
            {/* Name */}
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl 
                         bg-gray-50 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 
                         transition-all"
              required
            />

            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl 
                         bg-gray-50 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 
                         transition-all"
              required
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl 
                         bg-gray-50 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 
                         transition-all"
              required
            />

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl 
                         bg-gray-50 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 
                         transition-all"
              required
            />

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 
                         text-white p-2 rounded-xl font-semibold
                         hover:from-indigo-600 hover:to-blue-600 
                         transition-all active:scale-95 shadow-md"
            >
              Register
            </button>

            <div className="text-center text-gray-400">— or —</div>

            <p className="text-center mb-2 text-gray-500">
              already have an account?{" "}
              <a
                href="/"
                className="text-indigo-600 hover:text-indigo-800 font-semibold transition"
              >
                login here
              </a>
            </p>

          </form>
        </div>
      </div>
    </>
  )
}

export default Register
