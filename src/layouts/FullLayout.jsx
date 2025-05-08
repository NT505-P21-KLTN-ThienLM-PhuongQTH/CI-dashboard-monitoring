import React from 'react'

function FullLayout({children}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-100 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <div className="flex flex-col items-center max-w-xs">
              <div className="block mb-4">
                <img
                  className="dark:hidden"
                  src="/assets/images/background/bg_logo_primary.png"
                  alt="Logo"
                  // width={231}
                  // height={48}
                />
                <img
                  className="hidden dark:block"
                  src="/assets/images/background/bg_logo_white.png"
                  alt="Logo"
                  // width={231}
                  // height={48}
                />
              </div>
            </div>
          </div>
        </div>
        {/* <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div> */}
      </div>
    </div>
  )
}

export default FullLayout